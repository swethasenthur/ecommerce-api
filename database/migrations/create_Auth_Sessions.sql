CREATE TABLE auth_sessions (
    id UNIQUEIDENTIFIER NOT NULL
        CONSTRAINT PK_auth_sessions PRIMARY KEY
        DEFAULT NEWSEQUENTIALID(),

    user_id UNIQUEIDENTIFIER NOT NULL,

    token_hash NVARCHAR(128) NOT NULL,

    family_id UNIQUEIDENTIFIER NOT NULL,

    parent_session_id UNIQUEIDENTIFIER NULL,

    expires_at DATETIME2 NOT NULL,

    used_at DATETIME2 NULL,

    revoked_at DATETIME2 NULL,

    created_at DATETIME2 NOT NULL
        CONSTRAINT DF_auth_sessions_created_at
        DEFAULT SYSUTCDATETIME(),

    CONSTRAINT UQ_auth_sessions_token_hash
        UNIQUE (token_hash),

    CONSTRAINT FK_auth_sessions_users
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT FK_auth_sessions_parent
        FOREIGN KEY (parent_session_id)
        REFERENCES auth_sessions(id)
);

CREATE INDEX IX_auth_sessions_user_id
    ON auth_sessions(user_id);

CREATE INDEX IX_auth_sessions_family_id
    ON auth_sessions(family_id);

CREATE INDEX IX_auth_sessions_expires_at
    ON auth_sessions(expires_at);