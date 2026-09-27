# Category API

A REST API for managing hierarchical categories using Node.js, Express, Prisma, and Microsoft SQL Server.

The Categories module is the first completed vertical slice of the application. It includes category listing, creation, retrieval, updating, deletion, validation, parent-child relationships, and database constraints.

---

## Table of Contents

- [Project Status](#project-status)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Configuration](#environment-configuration)
- [Database Configuration](#database-configuration)
- [Prisma Commands](#prisma-commands)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Categories API](#categories-api)
- [Category Data Model](#category-data-model)
- [Validation Rules](#validation-rules)
- [Category Relationships](#category-relationships)
- [Error Handling](#error-handling)
- [Testing](#testing)
- [Security and Git Rules](#security-and-git-rules)
- [Development Workflow](#development-workflow)
- [Design Decisions](#design-decisions)
- [Future Work](#future-work)
- [Troubleshooting](#troubleshooting)

---

## Project Status

### Completed

- Express application setup.
- Prisma integration.
- Microsoft SQL Server connection.
- Category list endpoint.
- Category creation endpoint.
- Category retrieval endpoint.
- Category validation.
- SQL Server GUID handling.
- Category parent-child relationship design.
- Swagger/OpenAPI documentation setup.
- Project setup and design documentation.

### Current phase

The project is proceeding through the following phases:

1. Option A: Automated testing.
2. Option B: API documentation.
3. Option C: Authentication and authorization.
4. Option D: Product module.

Option B documentation is being maintained through:

```text
docs/openapi.yaml
```

---

## Technology Stack

- Node.js.
- Express.
- Prisma ORM.
- Microsoft SQL Server.
- `express-validator`.
- Jest.
- Supertest.
- Swagger UI Express.
- OpenAPI.

Express-validator validation chains can be used as Express middleware and support validators, sanitizers, and modifiers. [web:322][web:412]

---

## Project Structure

The expected project structure is:

```text
your-project/
├── docs/
│   └── openapi.yaml
├── prisma/
│   └── schema.prisma
├── src/
│   ├── app.js
│   ├── server.js
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── repositories/
│   ├── routes/
│   ├── services/
│   └── validators/
├── tests/
│   ├── unit/
│   ├── integration/
│   └── api/
├── .env
├── .env.test
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

### Folder responsibilities

#### `src/`

Contains application runtime code.

#### `src/routes/`

Defines HTTP routes and connects them to validation middleware and controllers.

#### `src/controllers/`

Handles HTTP requests and responses.

#### `src/services/`

Contains business rules and application logic.

#### `src/repositories/`

Contains database access logic using Prisma Client.

#### `src/validators/`

Contains request validation rules.

#### `src/middleware/`

Contains shared middleware such as validation-result handling and error handling.

#### `prisma/`

Contains the Prisma schema.

#### `docs/`

Contains API documentation. This folder is at the project root and is not inside `src`.

#### `tests/`

Contains unit, integration, and HTTP/API tests.

---

## Architecture

The project uses a layered architecture:

```text
HTTP request
    ↓
Route
    ↓
Validation middleware
    ↓
Controller
    ↓
Service
    ↓
Repository
    ↓
Prisma Client
    ↓
Microsoft SQL Server
```

### Route

Routes define the HTTP method and URL.

Example:

```js
router.post(
  "/",
  validateCreateCategory,
  categoryController.createCategory
);
```

### Validation middleware

Validation middleware validates route parameters, query parameters, and request bodies before the controller runs.

### Controller

The controller handles HTTP-specific work:

- Reads parameters and request body.
- Calls the service.
- Sends the HTTP response.
- Passes errors to the error middleware.

### Service

The service contains business rules:

- Duplicate slug checks.
- Parent existence checks.
- Self-parent checks.
- Delete dependency checks.
- Hierarchy rules.

### Repository

The repository communicates with Prisma Client and performs database operations.

---

## Prerequisites

Install the following:

- Node.js 18 or newer.
- npm.
- Microsoft SQL Server.
- SQL Server Management Studio or another SQL client.
- A SQL Server database.
- A database user with the required permissions.

For local SQL Server setup, Prisma documents both native SQL Server installation and Docker-based SQL Server setup. [web:81]

Verify Node.js:

```powershell
node --version
```

Verify npm:

```powershell
npm --version
```

---

## Installation

From the project root, run:

```powershell
npm.cmd install
```

If the required packages have not yet been installed, use:

```powershell
npm.cmd install express @prisma/client express-validator swagger-ui-express yaml
```

Install development dependencies:

```powershell
npm.cmd install --save-dev prisma jest supertest nodemon
```

---

## Environment Configuration

Create a `.env` file at the project root:

```text
.env
```

Example:

```env
DATABASE_URL="sqlserver://localhost:1433;database=your_database;user=your_user;password=your_password;encrypt=true;trustServerCertificate=true"
PORT=3000
NODE_ENV=development
```

Replace the values with your actual SQL Server configuration.

Do not commit `.env`.

Add it to `.gitignore`:

```gitignore
.env
.env.*
!.env.example
node_modules/
coverage/
logs/
```

You may create a safe example file:

```text
.env.example
```

Example contents:

```env
DATABASE_URL="sqlserver://HOST:1433;database=DATABASE;user=USER;password=PASSWORD;encrypt=true;trustServerCertificate=true"
PORT=3000
NODE_ENV=development
```

Never place real passwords in `.env.example`.

---

## Database Configuration

The Prisma datasource uses SQL Server:

```prisma
datasource db {
  provider = "sqlserver"
  url      = env("DATABASE_URL")
}
```

The database connection is loaded from `DATABASE_URL`.

Prisma’s SQL Server setup uses a SQL Server connection URL configured through environment variables. [web:451][web:454]

### Existing database

This project connects to an existing SQL Server database. The existing database tables and columns are preserved.


### Important introspection rule

Do not run this command casually after manually adjusting Prisma model or field names:

```powershell
npx.cmd prisma db pull
```

Introspection may restore database-style names such as:

```prisma
categories
parent_id
created_at
```

If introspection is required, review the generated schema and reapply the intended mappings.

---

## Prisma Commands

Format the Prisma schema:

```powershell
npx.cmd prisma format
```

Validate the Prisma schema:

```powershell
npx.cmd prisma validate
```

Generate Prisma Client:

```powershell
npx.cmd prisma generate
```

Open Prisma Studio:

```powershell
npx.cmd prisma studio
```

Inspect the current database schema:

```powershell
npx.cmd prisma db pull
```

Use `db pull` only when intentionally synchronizing from SQL Server.

---

## Running the Application

Start the development server:

```powershell
npm.cmd run dev
```

Start the application normally:

```powershell
npm.cmd start
```

If scripts are not yet present in `package.json`, add:

```json
{
  "scripts": {
    "dev": "nodemon src/server.js",
    "start": "node src/server.js",
    "test": "jest --runInBand",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

The local API base URL is:

```text
http://localhost:3000
```

The versioned API base URL is:

```text
http://localhost:3000/api/v1
```

---

## API Documentation

The OpenAPI specification is located at:

```text
docs/openapi.yaml
```

This file must be at the project root:

```text
your-project/docs/openapi.yaml
```

It must not be placed here:

```text
your-project/src/docs/openapi.yaml
```

OpenAPI provides a standard, language-independent description of HTTP APIs. [web:453]

### Swagger UI URL

When the server is running, open:

```text
http://localhost:3000/api-docs
```

### Swagger dependencies

Install:

```powershell
npm.cmd install swagger-ui-express yaml
```

### Swagger setup

The OpenAPI file is loaded in the Express application:

```js
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import YAML from "yaml";
import swaggerUi from "swagger-ui-express";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const openapiPath = path.join(__dirname, "../docs/openapi.yaml");

const openapiDocument = YAML.parse(
  fs.readFileSync(openapiPath, "utf8")
);

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(openapiDocument)
);
```

Swagger UI Express serves the OpenAPI document through an Express route. [web:433]

---

## Categories API

The category API base path is:

```text
/api/v1/categories
```

### Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/categories` | List categories |
| POST | `/api/v1/categories` | Create a category |
| GET | `/api/v1/categories/:id` | Get a category by ID |
| GET | `/api/v1/categories/slug/:slug` | Get a category by slug |
| PATCH | `/api/v1/categories/:id` | Update a category |
| DELETE | `/api/v1/categories/:id` | Delete a category |

---

## List Categories

Request:

```http
GET /api/v1/categories
```

Optional query parameters:

```text
skip
take
includeChildren
```

Example:

```text
GET /api/v1/categories?skip=0&take=20&includeChildren=true
```

Expected response:

```json
{
  "data": [
    {
      "id": "8f6c2e3a-4c1d-4b7a-9f25-2a6d7e8c9012",
      "name": "Electronics",
      "slug": "electronics",
      "description": "Electronic products",
      "parentId": null
    }
  ]
}
```

---

## Create Category

Request:

```http
POST /api/v1/categories
Content-Type: application/json
```

Request body:

```json
{
  "name": "Shoes",
  "slug": "shoes",
  "description": "Footwear"
}
```

Expected status:

```text
201 Created
```

Expected response:

```json
{
  "data": {
    "id": "8f6c2e3a-4c1d-4b7a-9f25-2a6d7e8c9012",
    "name": "Shoes",
    "slug": "shoes",
    "description": "Footwear",
    "parentId": null
  }
}
```

### Create a child category

```json
{
  "name": "Running Shoes",
  "slug": "running-shoes",
  "description": "Shoes for running",
  "parentId": "8f6c2e3a-4c1d-4b7a-9f25-2a6d7e8c9012"
}
```

### Create behavior

The POST endpoint must use Prisma `create()`:

```js
await prisma.categories.create({
  data: {
    name,
    slug,
    description,
    parentId
  }
});
```

It must not use `upsert()`.

Incorrect:

```js
await prisma.categories.upsert({
  where: {
    slug
  },
  update: data,
  create: data
});
```

Using `upsert()` would update the existing category when the submitted slug already exists.

### Duplicate slug

If `electronics` already exists, this request:

```json
{
  "name": "Shoes",
  "slug": "electronics",
  "description": "Footwear"
}
```

must return:

```text
409 Conflict
```

It must not modify the existing `electronics` category.

---

## Get Category by ID

Request:

```http
GET /api/v1/categories/:id
```

Example:

```text
GET /api/v1/categories/8f6c2e3a-4c1d-4b7a-9f25-2a6d7e8c9012
```

The `id` must be a valid SQL Server GUID shape:

```text
xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

The value must contain:

- 8 hexadecimal characters.
- A hyphen.
- 4 hexadecimal characters.
- A hyphen.
- 4 hexadecimal characters.
- A hyphen.
- 4 hexadecimal characters.
- A hyphen.
- 12 hexadecimal characters.

Validation pattern:

```js
const guidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
```

The API uses GUID-shape validation because SQL Server generates category IDs using `NEWSEQUENTIALID()`.

---

## Get Category by Slug

Request:

```http
GET /api/v1/categories/slug/:slug
```

Example:

```text
GET /api/v1/categories/slug/electronics
```

Slug format:

```text
electronics
home-appliances
running-shoes
```

Invalid examples:

```text
Electronics
running shoes
running_shoes
running--shoes
```

---

## Update Category

Request:

```http
PATCH /api/v1/categories/:id
Content-Type: application/json
```

Example:

```text
PATCH /api/v1/categories/8f6c2e3a-4c1d-4b7a-9f25-2a6d7e8c9012
```

Request body:

```json
{
  "description": "Updated description"
}
```

Expected status:

```text
200 OK
```

Only permitted fields may be updated:

```text
name
slug
description
parentId
```

Unknown fields must be rejected.

---

## Delete Category

Request:

```http
DELETE /api/v1/categories/:id
```

Example:

```text
DELETE /api/v1/categories/8f6c2e3a-4c1d-4b7a-9f25-2a6d7e8c9012
```

Expected status for a successful deletion:

```text
204 No Content
```

A category cannot be deleted if:

- It has child categories.
- It is referenced by products.
- Another business rule prevents deletion.

Such cases return:

```text
409 Conflict
```

---

## Category Data Model

The category primary key is a SQL Server `uniqueidentifier`:

```prisma
id String
  @id(map: "PK_categories")
  @default(
    dbgenerated("newsequentialid()"),
    map: "DF__categories__id__35BCFE0A"
  )
  @db.UniqueIdentifier
```

The category model includes:

```text
id
name
slug
description
parentId
parent
children
```

### Example Prisma model

```prisma
model categories {
  id          String      @id(map: "PK_categories") @default(dbgenerated("newsequentialid()"), map: "DF__categories__id__35BCFE0A") @db.UniqueIdentifier
  name        String      @db.NVarChar(150)
  slug        String      @unique @db.NVarChar(180)
  description String?     @db.NVarChar(500)
  parentId    String?     @map("parent_id") @db.UniqueIdentifier

  parent   Category?  @relation("CategoryTree", fields: [parentId], references: [id], onDelete: NoAction, onUpdate: NoAction)
  children Category[] @relation("CategoryTree")

}
```

---

## Validation Rules

### Create validation

- `name` is required.
- `name` must be a string.
- `name` must not be empty after trimming.
- `name` has a configured maximum length.
- `slug` is required.
- `slug` must be URL-safe.
- `slug` must be unique.
- `description` is optional.
- `parentId` is optional.
- `parentId` must be a valid GUID when provided.
- Unknown fields are rejected.
- The parent category must exist when `parentId` is provided.
- A category cannot be its own parent.

### Read validation

- `id` is required.
- `id` must be a valid GUID.
- A malformed ID returns `400`.
- A valid but nonexistent ID returns `404`.

### Update validation

- `id` must be a valid GUID.
- At least one permitted field must be supplied.
- Unknown fields are rejected.
- A changed slug must be unique.
- A supplied parent must exist.
- A category cannot be its own parent.
- Cyclic parent relationships are rejected.

### Delete validation

- `id` must be a valid GUID.
- A missing category returns `404`.
- Categories with children cannot be deleted.
- Categories referenced by products cannot be deleted.

---

## Category Relationships

Categories use a self-referencing parent-child relationship.

```text
Category
├── parent
└── children[]
```

A root category:

```text
parentId = null
```

A child category:

```text
parentId = parent category ID
```

The Prisma relation is:

```prisma
parent   Category?
children Category[]
```

Both relation fields use:

```prisma
@relation("CategoryTree")
```

The relation field names used in Prisma queries must exactly match the schema:

```js
include: {
  parent: true,
  children: true
}
```

If the generated Prisma Client does not expose `parent`, then the schema does not currently define a `parent` relation field and the include must be removed or the relation must be added to the schema.

---

## Database Constraints

### Primary key

```text
categories.id
```

Uses SQL Server `uniqueidentifier`.

### Unique slug

```text
categories.slug
```

The slug must be unique.

### Parent foreign key

```text
categories.parent_id
```

References:

```text
categories.id
```

### Delete behavior

The category hierarchy uses restrictive delete behavior:

```prisma
onDelete: NoAction
onUpdate: NoAction
```

The service checks dependencies before deletion.

---

## Error Handling

### Validation error

Status:

```text
400 Bad Request
```

Example:

```json
{
  "error": "Validation failed",
  "details": [
    {
      "location": "params",
      "field": "id",
      "message": "id must be a valid GUID"
    }
  ]
}
```

### Not found

Status:

```text
404 Not Found
```

Example:

```json
{
  "error": "Category not found"
}
```

### Conflict

Status:

```text
409 Conflict
```

Examples:

```json
{
  "error": "Category slug already exists"
}
```

```json
{
  "error": "Category cannot be deleted because it has child categories"
}
```

### Internal server error

Status:

```text
500 Internal Server Error
```

Production responses must not expose:

- Database passwords.
- Connection strings.
- SQL statements.
- Internal stack traces.
- File system paths.

---

## Testing

Automated testing is Option A.

### Test structure

```text
tests/
├── unit/
│   ├── category.validation.test.js
│   └── category.service.test.js
├── integration/
│   └── category.repository.test.js
└── api/
    └── category.routes.test.js
```

### Test dependencies

Install:

```powershell
npm.cmd install --save-dev jest supertest
```

### Test scripts

Add to `package.json`:

```json
{
  "scripts": {
    "test": "jest --runInBand",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

### Unit tests

Unit tests should cover:

- Required category name.
- Empty category name.
- Valid slug.
- Invalid slug.
- Valid GUID.
- Invalid GUID.
- Duplicate slug service behavior.
- Missing parent service behavior.
- Self-parent service behavior.
- Category-not-found behavior.
- Delete dependency behavior.

### Integration tests

Integration tests should use a dedicated test database.

Do not run destructive test cleanup against the development or production database.

Integration tests should cover:

- Creating a category.
- Listing categories.
- Finding a category by ID.
- Finding a category by slug.
- Updating a category.
- Deleting a category.
- Duplicate slug database behavior.
- Parent-child relation behavior.

### HTTP tests

HTTP tests should use Supertest against the Express app.

The Express app should be exported separately from the server listener:

```js
// src/app.js
export default app;
```

The server should start separately:

```js
// src/server.js
import app from "./app.js";

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
```

This allows tests to import the app without opening a real network port.

### Run tests

```powershell
npm.cmd test
```

Run tests in watch mode:

```powershell
npm.cmd run test:watch
```

Generate coverage:

```powershell
npm.cmd run test:coverage
```

---

## Security and Git Rules

Never commit:

```text
.env
.env.test
node_modules/
coverage/
database backups
database passwords
private keys
production logs
```

Commit:

```text
src/
prisma/schema.prisma
docs/openapi.yaml
tests/
README.md
package.json
package-lock.json
```

Before committing:

```powershell
git status
git diff
npx.cmd prisma validate
npm.cmd test
```

---

## Development Workflow

### Start the project

```powershell
npm.cmd install
npx.cmd prisma validate
npx.cmd prisma generate
npm.cmd run dev
```

### Check categories

```text
GET http://localhost:3000/api/v1/categories
```

### Open API documentation

```text
http://localhost:3000/api-docs
```

### Run tests

```powershell
npm.cmd test
```

### Format and validate Prisma

```powershell
npx.cmd prisma format
npx.cmd prisma validate
```

### Restart after schema changes

```powershell
Ctrl + C
npx.cmd prisma generate
npm.cmd run dev
```

---

## Design Decisions

### Prisma naming

Prisma model names use singular PascalCase:

```text
Category
User
Product
```

Database table names remain mapped with `@@map`.

### Field naming

Application-facing fields use camelCase where practical:

```text
parentId
createdAt
updatedAt
```

Legacy SQL Server columns are mapped using `@map`.

### Category IDs

Category IDs remain database-generated using SQL Server:

```sql
NEWSEQUENTIALID()
```

The API validates their GUID structure rather than requiring strict UUID version 4 bits.

### Category hierarchy

The category hierarchy uses a Prisma self-relation named:

```text
CategoryTree
```

### POST behavior

POST creates a new category only.

It does not update existing records.

It does not use `upsert()`.

Duplicate slugs return `409 Conflict`.

### Delete behavior

Categories with dependent children or products cannot be deleted.

### API versioning

The API uses:

```text
/api/v1
```

Future breaking changes should use a new API version.

---

## Future Work

### Option A: Automated testing

- Unit tests.
- Repository integration tests.
- HTTP tests.
- Coverage reporting.
- CI test execution.

### Option B: API documentation

- OpenAPI specification.
- Swagger UI.
- Request examples.
- Response examples.
- Error documentation.

### Option C: Authentication and authorization

Planned features include:

- User registration.
- Password hashing.
- Login.
- Access tokens.
- Refresh tokens.
- Authentication middleware.
- Role-based authorization.
- Admin-only category operations.

### Option D: Product module

Planned features include:

- Products.
- Product variants.
- Product images.
- Product-category relationships.
- Product CRUD.
- Product validation.
- Product search and filtering.

---

## Troubleshooting

### `Unknown argument parentId`

Check whether the Prisma schema exposes:

```prisma
parentId
```

or:

```prisma
parent_id
```

The Prisma query must use the exact field name exposed by the generated client.

For camelCase mapping:

```prisma
parentId String? @map("parent_id")
```

Then use:

```js
where: {
  parentId
}
```

### `Unknown field parent for include`

The `Category` model must define:

```prisma
parent Category?
```

and:

```prisma
children Category[]
```

After changing the schema, run:

```powershell
npx.cmd prisma format
npx.cmd prisma validate
npx.cmd prisma generate
```

### `id must be a valid UUID`

The database uses:

```sql
NEWSEQUENTIALID()
```

Validate the ID as a GUID shape, not strict UUID version 4:

```js
const guidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
```

### POST updates an existing category

Check that the repository uses:

```js
prisma.category.create()
```

and not:

```js
prisma.category.upsert()
```

POST must create a new row or return `409 Conflict` for a duplicate slug.

### Prisma Client is outdated

Run:

```powershell
npx.cmd prisma generate
```

Then restart the server:

```powershell
Ctrl + C
npm.cmd run dev
```

### Swagger UI cannot find the OpenAPI file

Confirm that the file is located at:

```text
project-root/docs/openapi.yaml
```

If loading from `src/app.js`, the path should normally be:

```js
path.join(__dirname, "../docs/openapi.yaml")
```

---

## Reference Documentation

- Prisma SQL Server documentation:  
  https://www.prisma.io/docs/orm/v7/core-concepts/supported-databases/sql-server

- Prisma database mapping documentation:  
  https://www.prisma.io/docs/orm/v7/prisma-schema/data-model/database-mapping

- Prisma relations documentation:  
  https://www.prisma.io/docs/orm/v7/prisma-schema/data-model/relations

- Express-validator documentation:  
  https://express-validator.github.io/docs/

- OpenAPI specification:  
  https://spec.openapis.org/oas/latest.html

- Swagger UI Express:  
  https://www.npmjs.com/package/swagger-ui-express