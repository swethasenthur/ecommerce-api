USE ecommerce;
GO

CREATE TABLE dbo.users (
    id UNIQUEIDENTIFIER NOT NULL
        CONSTRAINT PK_users PRIMARY KEY
        DEFAULT NEWSEQUENTIALID(),

    email NVARCHAR(320) NOT NULL,
    password_hash NVARCHAR(255) NOT NULL,
    first_name NVARCHAR(100) NOT NULL,
    last_name NVARCHAR(100) NOT NULL,
    role NVARCHAR(20) NOT NULL
        CONSTRAINT DF_users_role DEFAULT 'CUSTOMER',
    status NVARCHAR(20) NOT NULL
        CONSTRAINT DF_users_status DEFAULT 'ACTIVE',
    created_at DATETIME2(3) NOT NULL
        CONSTRAINT DF_users_created_at DEFAULT SYSUTCDATETIME(),
    updated_at DATETIME2(3) NOT NULL
        CONSTRAINT DF_users_updated_at DEFAULT SYSUTCDATETIME(),

    CONSTRAINT UQ_users_email UNIQUE (email),
    CONSTRAINT CK_users_role
        CHECK (role IN ('CUSTOMER', 'ADMIN', 'STAFF')),
    CONSTRAINT CK_users_status
        CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED'))
);
GO

CREATE TABLE dbo.addresses (
    id UNIQUEIDENTIFIER NOT NULL
        CONSTRAINT PK_addresses PRIMARY KEY
        DEFAULT NEWSEQUENTIALID(),

    user_id UNIQUEIDENTIFIER NOT NULL,
    label NVARCHAR(50) NULL,
    recipient_name NVARCHAR(200) NOT NULL,
    line1 NVARCHAR(200) NOT NULL,
    line2 NVARCHAR(200) NULL,
    city NVARCHAR(100) NOT NULL,
    state NVARCHAR(100) NOT NULL,
    postal_code NVARCHAR(20) NOT NULL,
    country NVARCHAR(2) NOT NULL,
    is_default BIT NOT NULL
        CONSTRAINT DF_addresses_is_default DEFAULT 0,
    created_at DATETIME2(3) NOT NULL
        CONSTRAINT DF_addresses_created_at DEFAULT SYSUTCDATETIME(),
    updated_at DATETIME2(3) NOT NULL
        CONSTRAINT DF_addresses_updated_at DEFAULT SYSUTCDATETIME(),

    CONSTRAINT FK_addresses_users
        FOREIGN KEY (user_id) REFERENCES dbo.users(id)
        ON DELETE CASCADE
);
GO

CREATE INDEX IX_addresses_user_id
    ON dbo.addresses(user_id);
GO

CREATE TABLE dbo.categories (
    id UNIQUEIDENTIFIER NOT NULL
        CONSTRAINT PK_categories PRIMARY KEY
        DEFAULT NEWSEQUENTIALID(),

    name NVARCHAR(150) NOT NULL,
    slug NVARCHAR(180) NOT NULL,
    description NVARCHAR(500) NULL,
    parent_id UNIQUEIDENTIFIER NULL,
    created_at DATETIME2(3) NOT NULL
        CONSTRAINT DF_categories_created_at DEFAULT SYSUTCDATETIME(),
    updated_at DATETIME2(3) NOT NULL
        CONSTRAINT DF_categories_updated_at DEFAULT SYSUTCDATETIME(),

    CONSTRAINT UQ_categories_slug UNIQUE (slug),
    CONSTRAINT FK_categories_parent
        FOREIGN KEY (parent_id) REFERENCES dbo.categories(id)
);
GO

CREATE INDEX IX_categories_parent_id
    ON dbo.categories(parent_id);
GO

CREATE TABLE dbo.products (
    id UNIQUEIDENTIFIER NOT NULL
        CONSTRAINT PK_products PRIMARY KEY
        DEFAULT NEWSEQUENTIALID(),

    category_id UNIQUEIDENTIFIER NOT NULL,
    created_by_id UNIQUEIDENTIFIER NOT NULL,
    name NVARCHAR(200) NOT NULL,
    slug NVARCHAR(220) NOT NULL,
    description NVARCHAR(MAX) NULL,
    status NVARCHAR(20) NOT NULL
        CONSTRAINT DF_products_status DEFAULT 'DRAFT',
    created_at DATETIME2(3) NOT NULL
        CONSTRAINT DF_products_created_at DEFAULT SYSUTCDATETIME(),
    updated_at DATETIME2(3) NOT NULL
        CONSTRAINT DF_products_updated_at DEFAULT SYSUTCDATETIME(),

    CONSTRAINT UQ_products_slug UNIQUE (slug),
    CONSTRAINT FK_products_categories
        FOREIGN KEY (category_id) REFERENCES dbo.categories(id),
    CONSTRAINT FK_products_users
        FOREIGN KEY (created_by_id) REFERENCES dbo.users(id),
    CONSTRAINT CK_products_status
        CHECK (status IN ('DRAFT', 'ACTIVE', 'ARCHIVED'))
);
GO

CREATE INDEX IX_products_category_id
    ON dbo.products(category_id);

CREATE INDEX IX_products_created_by_id
    ON dbo.products(created_by_id);

CREATE INDEX IX_products_status
    ON dbo.products(status);
GO

CREATE TABLE dbo.product_variants (
    id UNIQUEIDENTIFIER NOT NULL
        CONSTRAINT PK_product_variants PRIMARY KEY
        DEFAULT NEWSEQUENTIALID(),

    product_id UNIQUEIDENTIFIER NOT NULL,
    sku NVARCHAR(100) NOT NULL,
    name NVARCHAR(150) NOT NULL,
    price DECIMAL(18, 2) NOT NULL,
    compare_at_price DECIMAL(18, 2) NULL,
    attributes NVARCHAR(MAX) NULL,
    is_active BIT NOT NULL
        CONSTRAINT DF_product_variants_is_active DEFAULT 1,
    created_at DATETIME2(3) NOT NULL
        CONSTRAINT DF_product_variants_created_at DEFAULT SYSUTCDATETIME(),
    updated_at DATETIME2(3) NOT NULL
        CONSTRAINT DF_product_variants_updated_at DEFAULT SYSUTCDATETIME(),

    CONSTRAINT UQ_product_variants_sku UNIQUE (sku),
    CONSTRAINT FK_product_variants_products
        FOREIGN KEY (product_id) REFERENCES dbo.products(id)
        ON DELETE CASCADE,
    CONSTRAINT CK_product_variants_price
        CHECK (price >= 0),
    CONSTRAINT CK_product_variants_compare_price
        CHECK (compare_at_price IS NULL OR compare_at_price >= price)
);
GO

CREATE INDEX IX_product_variants_product_id
    ON dbo.product_variants(product_id);
GO

CREATE TABLE dbo.product_images (
    id UNIQUEIDENTIFIER NOT NULL
        CONSTRAINT PK_product_images PRIMARY KEY
        DEFAULT NEWSEQUENTIALID(),

    product_id UNIQUEIDENTIFIER NOT NULL,
    variant_id UNIQUEIDENTIFIER NULL,
    url NVARCHAR(1000) NOT NULL,
    alt_text NVARCHAR(255) NULL,
    sort_order INT NOT NULL
        CONSTRAINT DF_product_images_sort_order DEFAULT 0,
    created_at DATETIME2(3) NOT NULL
        CONSTRAINT DF_product_images_created_at DEFAULT SYSUTCDATETIME(),

    CONSTRAINT FK_product_images_products
        FOREIGN KEY (product_id) REFERENCES dbo.products(id)
        ON DELETE CASCADE,
    CONSTRAINT FK_product_images_variants
        FOREIGN KEY (variant_id) REFERENCES dbo.product_variants(id)
);
GO

CREATE INDEX IX_product_images_product_id
    ON dbo.product_images(product_id);

CREATE INDEX IX_product_images_variant_id
    ON dbo.product_images(variant_id);
GO

SET XACT_ABORT ON;

BEGIN TRY
    BEGIN TRANSACTION;

    /*
      1. Drop the old product-to-category foreign key.
    */
    IF EXISTS
    (
        SELECT 1
        FROM sys.foreign_keys
        WHERE name = N'FK_products_categories'
          AND parent_object_id = OBJECT_ID(N'dbo.products')
    )
    BEGIN
        ALTER TABLE dbo.products
        DROP CONSTRAINT FK_products_categories;
    END;

    /*
      2. Drop the old products.category_id index.
    */
    IF EXISTS
    (
        SELECT 1
        FROM sys.indexes
        WHERE name = N'IX_products_category_id'
          AND object_id = OBJECT_ID(N'dbo.products')
    )
    BEGIN
        DROP INDEX IX_products_category_id
        ON dbo.products;
    END;

    /*
      3. Remove the old single-category column.
    */
    IF COL_LENGTH(N'dbo.products', N'category_id') IS NOT NULL
    BEGIN
        ALTER TABLE dbo.products
        DROP COLUMN category_id;
    END;

    /*
      4. Create an index on product_categories.category_id.
      The composite primary key usually indexes:
        (product_id, category_id)
      This additional index improves category-to-product lookups.
    */
    IF NOT EXISTS
    (
        SELECT 1
        FROM sys.indexes
        WHERE name = N'IX_product_categories_category_id'
          AND object_id = OBJECT_ID(N'dbo.product_categories')
    )
    BEGIN
        CREATE NONCLUSTERED INDEX IX_product_categories_category_id
        ON dbo.product_categories(category_id);
    END;

    /*
      5. Create an index on product_categories.product_id
      only if the existing primary key does not already begin with product_id.

      If the primary key is:
        (product_id, category_id)

      this separate index is not required for normal product lookups.
    */

    /*
      6. Recreate or confirm the categories.parent_id index.
    */
    IF NOT EXISTS
    (
        SELECT 1
        FROM sys.indexes
        WHERE name = N'IX_categories_parent_id'
          AND object_id = OBJECT_ID(N'dbo.categories')
    )
    BEGIN
        CREATE NONCLUSTERED INDEX IX_categories_parent_id
        ON dbo.categories(parent_id);
    END;

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF XACT_STATE() <> 0
    BEGIN
        ROLLBACK TRANSACTION;
    END;

    THROW;
END CATCH;