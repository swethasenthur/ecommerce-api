# Category API

A REST API for managing hierarchical categories using Node.js, Express, Prisma, and Microsoft SQL Server.

The Categories module is the first completed vertical slice of the application. It includes category listing, creation, retrieval, updating, deletion, validation, parent-child relationships, and database constraints.

The Authentication module is also implemented. It provides user registration, login, JWT access tokens, refresh tokens, token rotation, logout, and protected-route authorization.

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
- [Authentication API](#authentication-api)
- [Categories API](#categories-api)
- [Category Data Model](#category-data-model)
- [Authentication Data Model](#authentication-data-model)
- [Validation Rules](#validation-rules)
- [Category Relationships](#category-relationships)
- [Error Handling](#error-handling)
- [Testing](#testing)
- [Security and Git Rules](#security-and-git-rules)
- [Development Workflow](#development-workflow)
- [Design Decisions](#design-decisions)
- [Future Work](#future-work)
- [Troubleshooting](#troubleshooting)
- [Reference Documentation](#reference-documentation)

---

## Project Status

### Completed

- Express application setup.
- Prisma integration.
- Microsoft SQL Server connection.
- Category list endpoint.
- Category creation endpoint.
- Category retrieval endpoint.
- Category update endpoint.
- Category deletion endpoint.
- Category validation.
- SQL Server GUID handling.
- Category parent-child relationship design.
- Swagger/OpenAPI documentation setup.
- Project setup and design documentation.
- User registration endpoint.
- User login endpoint.
- Password hashing.
- Password validation.
- JWT access-token generation.
- Refresh-token generation.
- Refresh-token rotation.
- Refresh-token revocation.
- Logout functionality.
- Protected route authorization.
- Authentication middleware.
- Authentication validation.
- Authentication error handling.
- User-to-authentication-session relationship design.

### Current Phase

The project is proceeding through the following phases:

1. **Option A: Automated testing.**
2. **Option B: API documentation.**
3. **Option C: Authentication and authorization — implemented.**
4. **Option D: Product module.**

Option B documentation is maintained through:

```text
docs/openapi.yaml
```

Option C authentication and authorization is implemented through the authentication routes, controllers, services, repositories, validators, middleware, and session storage.

---

## Technology Stack

- Node.js.
- Express.
- Prisma ORM.
- Microsoft SQL Server.
- `express-validator`.
- JWT.
- Password-hashing library.
- Jest.
- Supertest.
- Swagger UI Express.
- OpenAPI.

Express-validator validation chains can be used as Express middleware and support validators, sanitizers, and modifiers. [web:322][web:412]

Prisma supports SQL Server through a SQL Server datasource and connection URL configured through environment variables. [web:715][web:716]

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

### Folder Responsibilities

#### `src/`

Contains application runtime code.

#### `src/routes/`

Defines HTTP routes and connects them to validation middleware, authentication middleware, and controllers.

#### `src/controllers/`

Handles HTTP requests and responses.

#### `src/services/`

Contains business rules and application logic, including authentication, token handling, category rules, and product rules.

#### `src/repositories/`

Contains database access logic using Prisma Client.

#### `src/validators/`

Contains request validation rules.

#### `src/middleware/`

Contains shared middleware such as:

- Authentication middleware.
- Authorization middleware.
- Validation-result handling.
- Error handling.
- Request logging.

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
Authentication middleware
    ↓
Authorization middleware
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

Authentication middleware is applied only to protected routes. Public routes such as registration and login do not require an access token.

### Route

Routes define the HTTP method and URL.

Example public route:

```js
router.post(
  "/register",
  validateRegister,
  authController.register
);
```

Example protected route:

```js
router.get(
  "/me",
  authenticate,
  authController.getCurrentUser
);
```

### Authentication Middleware

Authentication middleware:

1. Reads the `Authorization` header.
2. Extracts the bearer token.
3. Verifies the JWT.
4. Loads or validates the authenticated user.
5. Adds authenticated-user information to the request.
6. Rejects invalid or expired tokens.

Protected requests use:

```http
Authorization: Bearer <access-token>
```

Swagger/OpenAPI represents bearer authentication using an HTTP bearer security scheme and applies it to protected operations. [web:707][web:708]

### Authorization Middleware

Authorization middleware checks whether the authenticated user has permission to perform an operation.

The current implementation supports authenticated-route protection. Role-based authorization is planned future work.

### Controller

The controller handles HTTP-specific work:

- Reads parameters and request body.
- Reads the authenticated user from the request.
- Calls the service.
- Sends the HTTP response.
- Passes errors to the error middleware.

### Service

The service contains business rules:

- Password hashing.
- Password comparison.
- Access-token creation.
- Refresh-token creation.
- Refresh-token rotation.
- Refresh-token revocation.
- Duplicate user checks.
- Duplicate slug checks.
- Parent existence checks.
- Self-parent checks.
- Delete dependency checks.
- Category hierarchy rules.

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

If the required runtime packages have not yet been installed, use:

```powershell
npm.cmd install express @prisma/client express-validator jsonwebtoken bcrypt swagger-ui-express yaml
```

Install development dependencies:

```powershell
npm.cmd install --save-dev prisma jest supertest nodemon
```

If a different password-hashing package is used by the implementation, install and document that package instead of `bcrypt`.

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

JWT_ACCESS_SECRET="replace-with-a-long-random-access-secret"
JWT_REFRESH_SECRET="replace-with-a-long-random-refresh-secret"
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
```

Replace the values with your actual configuration.

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

JWT_ACCESS_SECRET="replace-with-a-random-secret"
JWT_REFRESH_SECRET="replace-with-a-random-secret"
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
```

Never place real passwords, JWT secrets, private keys, or production credentials in `.env.example`.

### Authentication Environment Variables

| Variable | Description |
|---|---|
| `JWT_ACCESS_SECRET` | Secret used to sign access tokens |
| `JWT_REFRESH_SECRET` | Secret used to sign refresh tokens |
| `JWT_ACCESS_EXPIRES_IN` | Access-token lifetime |
| `JWT_REFRESH_EXPIRES_IN` | Refresh-token lifetime |

Use separate secrets for access tokens and refresh tokens.

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

### Existing Database

This project connects to an existing SQL Server database. The existing database tables and columns are preserved.

### Authentication Tables

The authentication module requires user and session data.

The expected logical tables are:

```text
users
auth_sessions
```

The `users` table stores user identity and password information.

The `auth_sessions` table stores refresh-token session information and its relationship to the user.

### Important Introspection Rule

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

### Swagger Dependencies

Install:

```powershell
npm.cmd install swagger-ui-express yaml
```

### Swagger Setup

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

## Authentication API

The authentication API base path is:

```text
/api/v1/auth
```

### Authentication Endpoints

| Method | Endpoint | Description | Authentication |
|---|---|---|---|
| POST | `/api/v1/auth/register` | Register a new user | Not required |
| POST | `/api/v1/auth/login` | Authenticate a user and issue tokens | Not required |
| POST | `/api/v1/auth/refresh` | Rotate the refresh token and issue a new access token | Refresh token required |
| POST | `/api/v1/auth/logout` | Revoke the refresh-token session | Access token required |
| GET | `/api/v1/auth/me` | Retrieve the authenticated user | Access token required |

### Register User

Request:

```http
POST /api/v1/auth/register
Content-Type: application/json
```

Request body:

```json
{
  "email": "user@example.com",
  "password": "StrongPassword123",
  "name": "Example User"
}
```

Expected status:

```text
201 Created
```

Example response:

```json
{
  "data": {
    "id": "8f6c2e3a-4c1d-4b7a-9f25-2a6d7e8c9012",
    "email": "user@example.com",
    "name": "Example User"
  }
}
```

The registration response must not expose:

- The password.
- The password hash.
- JWT secrets.
- Refresh-token hashes.
- Internal database details.

### Login

Request:

```http
POST /api/v1/auth/login
Content-Type: application/json
```

Request body:

```json
{
  "email": "user@example.com",
  "password": "StrongPassword123"
}
```

Expected status:

```text
200 OK
```

Example response:

```json
{
  "data": {
    "accessToken": "<access-token>",
    "refreshToken": "<refresh-token>",
    "user": {
      "id": "8f6c2e3a-4c1d-4b7a-9f25-2a6d7e8c9012",
      "email": "user@example.com",
      "name": "Example User"
    }
  }
}
```

### Refresh Access Token

Request:

```http
POST /api/v1/auth/refresh
Content-Type: application/json
```

Request body:

```json
{
  "refreshToken": "<refresh-token>"
}
```

Expected status:

```text
200 OK
```

Example response:

```json
{
  "data": {
    "accessToken": "<new-access-token>",
    "refreshToken": "<new-refresh-token>"
  }
}
```

A successful refresh operation rotates the refresh token. The previous refresh token must no longer be accepted after rotation.

### Logout

Request:

```http
POST /api/v1/auth/logout
Authorization: Bearer <access-token>
Content-Type: application/json
```

Request body:

```json
{
  "refreshToken": "<refresh-token>"
}
```

Expected status:

```text
204 No Content
```

Logout revokes the refresh-token session and prevents the refresh token from being used again.

### Get Current User

Request:

```http
GET /api/v1/auth/me
Authorization: Bearer <access-token>
```

Expected status:

```text
200 OK
```

Example response:

```json
{
  "data": {
    "id": "8f6c2e3a-4c1d-4b7a-9f25-2a6d7e8c9012",
    "email": "user@example.com",
    "name": "Example User"
  }
}
```

### Access Token Usage

Include the access token in the `Authorization` header:

```http
Authorization: Bearer <access-token>
```

The access token is used for protected endpoints.

The refresh token must not be sent as an access token. It is used only with the refresh operation and logout flow.

### Authentication Status Codes

| Status code | Meaning |
|---|---|
| `200` | Request completed successfully |
| `201` | User registered successfully |
| `204` | Logout completed successfully |
| `400` | Invalid request or validation error |
| `401` | Missing, invalid, expired, or revoked token |
| `403` | Authenticated user is not authorized |
| `409` | User already exists |
| `500` | Internal server error |

---

## Categories API

The category API base path is:

```text
/api/v1/categories
```

### Authentication Requirement

Category route protection depends on the configured route policy.

When category routes are protected, include:

```http
Authorization: Bearer <access-token>
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
Authorization: Bearer <access-token>
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

### Create a Child Category

```json
{
  "name": "Running Shoes",
  "slug": "running-shoes",
  "description": "Shoes for running",
  "parentId": "8f6c2e3a-4c1d-4b7a-9f25-2a6d7e8c9012"
}
```

### Create Behavior

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

### Duplicate Slug

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
Authorization: Bearer <access-token>
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
Authorization: Bearer <access-token>
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

### Example Prisma Model

```prisma
model categories {
  id          String     @id(map: "PK_categories") @default(dbgenerated("newsequentialid()"), map: "DF__categories__id__35BCFE0A") @db.UniqueIdentifier
  name        String     @db.NVarChar(150)
  slug        String     @unique @db.NVarChar(180)
  description String?    @db.NVarChar(500)
  parentId    String?    @map("parent_id") @db.UniqueIdentifier

  parent   categories?  @relation("CategoryTree", fields: [parentId], references: [id], onDelete: NoAction, onUpdate: NoAction)
  children categories[] @relation("CategoryTree")
}
```

Use the exact model and relation names generated by the current Prisma schema. If the generated client uses `Category` instead of `categories`, update repository examples to match the generated client.

---

## Authentication Data Model

The authentication module uses a user entity and refresh-token session storage.

### User Data

The user record contains information such as:

```text
id
email
passwordHash
name
createdAt
updatedAt
```

The password must be stored as a secure hash. Plain-text passwords must never be stored or returned in API responses.

### Authentication Session Data

The authentication session record contains information such as:

```text
id
userId
refreshTokenHash
expiresAt
revokedAt
createdAt
updatedAt
```

The refresh token itself should not be stored in plain text when the implementation uses hashed refresh-token storage.

### User-to-Session Relationship

A user can have multiple authentication sessions:

```text
users
  1
  |
  |--- many auth_sessions
```

The relationship is established through:

```text
auth_sessions.user_id
    REFERENCES users.id
```

---

## Validation Rules

### Authentication Registration Validation

- `email` is required.
- `email` must be a valid email address.
- `email` must be normalized consistently.
- `password` is required.
- `password` must meet the configured minimum length.
- `name` is optional unless required by the business rules.
- Unknown fields are rejected.
- Duplicate email addresses return `409 Conflict`.

### Authentication Login Validation

- `email` is required.
- `email` must be a valid email address.
- `password` is required.
- Invalid credentials return `401 Unauthorized`.
- The response must not reveal whether the email or password was incorrect.

### Refresh Token Validation

- `refreshToken` is required.
- The token must have a valid format.
- The token must not be expired.
- The token must not be revoked.
- A rotated token must not be accepted again.
- Invalid or reused refresh tokens return `401 Unauthorized`.

### Protected Route Validation

- The `Authorization` header is required.
- The header must use the bearer format.
- The access token must be valid.
- The access token must not be expired.
- The authenticated user must exist and be active.

### Create Validation

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

### Read Validation

- `id` is required.
- `id` must be a valid GUID.
- A malformed ID returns `400`.
- A valid but nonexistent ID returns `404`.

### Update Validation

- `id` must be a valid GUID.
- At least one permitted field must be supplied.
- Unknown fields are rejected.
- A changed slug must be unique.
- A supplied parent must exist.
- A category cannot be its own parent.
- Cyclic parent relationships are rejected.

### Delete Validation

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

### Primary Key

```text
categories.id
```

Uses SQL Server `uniqueidentifier`.

### Unique Slug

```text
categories.slug
```

The slug must be unique.

### Parent Foreign Key

```text
categories.parent_id
```

References:

```text
categories.id
```

### Delete Behavior

The category hierarchy uses restrictive delete behavior:

```prisma
onDelete: NoAction
onUpdate: NoAction
```

The service checks dependencies before deletion.

### Authentication Constraints

The authentication database should enforce:

- Unique user email.
- Valid user-to-session foreign key.
- Refresh-session expiration tracking.
- Refresh-session revocation tracking.
- Appropriate indexes for email and session lookup.

---

## Error Handling

### Validation Error

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

### Authentication Error

Status:

```text
401 Unauthorized
```

Example:

```json
{
  "error": "Invalid or expired authentication token"
}
```

Authentication errors must not expose sensitive token-validation details.

### Authorization Error

Status:

```text
403 Forbidden
```

Example:

```json
{
  "error": "You are not authorized to perform this action"
}
```

### Not Found

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
  "error": "User already exists"
}
```

```json
{
  "error": "Category cannot be deleted because it has child categories"
}
```

### Internal Server Error

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
- Password hashes.
- JWT secrets.
- Refresh-token values.
- Sensitive token-validation details.

---

## Testing

Automated testing is Option A.

Authentication testing is included in the automated-testing work.

### Test Structure

```text
tests/
├── unit/
│   ├── category.validation.test.js
│   ├── category.service.test.js
│   ├── auth.validation.test.js
│   └── auth.service.test.js
├── integration/
│   ├── category.repository.test.js
│   └── auth.repository.test.js
└── api/
    ├── category.routes.test.js
    └── auth.routes.test.js
```

### Test Dependencies

Install:

```powershell
npm.cmd install --save-dev jest supertest
```

### Test Scripts

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

### Authentication Unit Tests

Unit tests should cover:

- Registration validation.
- Invalid email validation.
- Weak-password validation.
- Duplicate-user behavior.
- Password hashing.
- Password comparison.
- Access-token creation.
- Refresh-token creation.
- Expired-token behavior.
- Invalid-token behavior.
- Refresh-token rotation.
- Refresh-token revocation.
- Logout behavior.
- Authentication middleware behavior.
- Authorization middleware behavior.

### Authentication HTTP Tests

HTTP tests should cover:

- Registering a user.
- Rejecting duplicate registration.
- Logging in with valid credentials.
- Rejecting invalid credentials.
- Refreshing tokens.
- Rejecting an expired refresh token.
- Rejecting a revoked refresh token.
- Rejecting reuse of a rotated refresh token.
- Accessing a protected endpoint with a valid access token.
- Rejecting a protected endpoint without a token.
- Rejecting a protected endpoint with an invalid token.
- Logging out and revoking the session.

### Category Unit Tests

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

### Integration Tests

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
- Creating a user.
- Creating an authentication session.
- Revoking an authentication session.

### HTTP Tests

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

### Run Tests

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
JWT secrets
private keys
production logs
password hashes
refresh tokens
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
.env.example
```

Before committing:

```powershell
git status
git diff
npx.cmd prisma validate
npm.cmd test
```

### Authentication Security Rules

- Store passwords only as secure hashes.
- Never log passwords.
- Never return password hashes in API responses.
- Use separate secrets for access and refresh tokens.
- Keep token secrets outside source control.
- Use HTTPS in non-local environments.
- Validate token expiration.
- Revoke refresh sessions during logout.
- Rotate refresh tokens after successful refresh.
- Reject previously rotated refresh tokens.
- Avoid exposing whether an email exists during failed login.
- Use short-lived access tokens.
- Apply appropriate rate limiting to registration and login endpoints.
- Do not place access tokens or refresh tokens in logs.

---

## Development Workflow

### Start the Project

```powershell
npm.cmd install
npx.cmd prisma validate
npx.cmd prisma generate
npm.cmd run dev
```

### Register a User

```text
POST http://localhost:3000/api/v1/auth/register
```

### Log In

```text
POST http://localhost:3000/api/v1/auth/login
```

### Check the Current User

```text
GET http://localhost:3000/api/v1/auth/me
Authorization: Bearer <access-token>
```

### Check Categories

```text
GET http://localhost:3000/api/v1/categories
```

### Open API Documentation

```text
http://localhost:3000/api-docs
```

### Run Tests

```powershell
npm.cmd test
```

### Format and Validate Prisma

```powershell
npx.cmd prisma format
npx.cmd prisma validate
```

### Restart After Schema Changes

```powershell
Ctrl + C
npx.cmd prisma generate
npm.cmd run dev
```

---

## Design Decisions

### Prisma Naming

Prisma model names use singular PascalCase where supported:

```text
Category
User
Product
```

Database table names remain mapped with `@@map`.

Use the actual names generated by the current Prisma schema in repository code.

### Field Naming

Application-facing fields use camelCase where practical:

```text
parentId
createdAt
updatedAt
passwordHash
refreshTokenHash
```

Legacy SQL Server columns are mapped using `@map`.

### Category IDs

Category IDs remain database-generated using SQL Server:

```sql
NEWSEQUENTIALID()
```

The API validates their GUID structure rather than requiring strict UUID version 4 bits.

### Category Hierarchy

The category hierarchy uses a Prisma self-relation named:

```text
CategoryTree
```

### POST Behavior

POST creates a new category only.

It does not update existing records.

It does not use `upsert()`.

Duplicate slugs return `409 Conflict`.

### Authentication Behavior

Registration creates a user after validating the request and hashing the password.

Login verifies the user credentials and returns an access token and refresh token.

Refresh-token requests rotate the refresh token and invalidate the previous token.

Logout revokes the active refresh-token session.

Protected routes require a valid access token.

### Token Separation

Access tokens and refresh tokens use separate signing secrets and separate expiration settings.

Access tokens are used for API authorization.

Refresh tokens are used to obtain replacement access tokens.

### Delete Behavior

Categories with dependent children or products cannot be deleted.

### API Versioning

The API uses:

```text
/api/v1
```

Future breaking changes should use a new API version.

---

## Future Work

### Option A: Automated Testing

- Complete unit tests.
- Complete repository integration tests.
- Complete HTTP tests.
- Add authentication test coverage.
- Add category authorization test coverage.
- Add coverage reporting.
- Add CI test execution.
- Add test database provisioning.
- Add test data factories.
- Add database cleanup utilities.

### Option B: API Documentation

- Keep the OpenAPI specification synchronized with implemented routes.
- Add authentication request examples.
- Add authentication response examples.
- Add bearer-authentication security definitions.
- Add protected-route security declarations.
- Add refresh-token error documentation.
- Add category authorization documentation.
- Add generated API documentation checks in CI.

### Option C: Authentication and Authorization

The core authentication and authorization module is implemented.

Future enhancements include:

- Role-based authorization.
- Admin-only category operations.
- User roles and permissions.
- Permission-based middleware.
- Account activation.
- Email verification.
- Password reset.
- Password-change endpoint.
- Account lockout after repeated failed logins.
- Login rate limiting.
- Device and session management.
- Logout from all sessions.
- Audit logging.
- Multi-factor authentication.
- OAuth or external identity-provider integration.
- Token reuse detection alerts.
- Security-event monitoring.

### Option D: Product Module

Planned features include:

- Products.
- Product variants.
- Product images.
- Product-category relationships.
- Product CRUD.
- Product validation.
- Product search and filtering.
- Product pagination.
- Product availability.
- Product authorization.
- Product-related automated tests.
- Product OpenAPI documentation.

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

### `Unknown Field parent for Include`

The category model must define:

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

### POST Updates an Existing Category

Check that the repository uses:

```js
prisma.category.create()
```

and not:

```js
prisma.category.upsert()
```

POST must create a new row or return `409 Conflict` for a duplicate slug.

### Invalid or Expired Authentication Token

Check that:

- The `Authorization` header is present.
- The header uses the `Bearer <token>` format.
- The access-token secret matches the configured secret.
- The access token has not expired.
- The token was generated by the expected application.
- The server has been restarted after environment changes.

Correct format:

```http
Authorization: Bearer <access-token>
```

### Refresh Token Rejected

Check that:

- The refresh token is present.
- The refresh token has not expired.
- The refresh-token session has not been revoked.
- The token has not already been rotated.
- The refresh-token secret is correct.
- The session belongs to an existing user.

A previously rotated refresh token should be rejected.

### Login Always Fails

Check that:

- The submitted email is normalized consistently.
- The user exists.
- The password hash was generated using the configured password-hashing library.
- The login code compares the submitted password with the stored hash.
- The password is not being compared directly with the hash.
- The server is using the correct database.

### Authentication Routes Return 404

Check that:

- The authentication router is mounted in `src/app.js`.
- The route prefix matches the README and OpenAPI document.
- The request uses `/api/v1/auth`.
- The server has been restarted after route changes.

Expected route examples:

```text
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/refresh
POST /api/v1/auth/logout
GET /api/v1/auth/me
```

### Prisma Client Is Outdated

Run:

```powershell
npx.cmd prisma generate
```

Then restart the server:

```powershell
Ctrl + C
npm.cmd run dev
```

### Swagger UI Cannot Find the OpenAPI File

Confirm that the file is located at:

```text
project-root/docs/openapi.yaml
```

If loading from `src/app.js`, the path should normally be:

```js
path.join(__dirname, "../docs/openapi.yaml")
```

### Swagger Does Not Show Authentication

Confirm that `docs/openapi.yaml` contains a bearer security scheme:

```yaml
components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
```

Protected operations must include:

```yaml
security:
  - bearerAuth: []
```

Bearer authentication must be applied to each protected operation or globally where appropriate. [web:707][web:708]

---

## Reference Documentation

- Prisma SQL Server documentation:  
  [https://www.prisma.io/docs/orm/v7/core-concepts/supported-databases/sql-server](https://www.prisma.io/docs/orm/v7/core-concepts/supported-databases/sql-server)

- Prisma existing SQL Server project documentation:  
  [https://www.prisma.io/docs/v7/prisma-orm/add-to-existing-project/sql-server](https://www.prisma.io/docs/v7/prisma-orm/add-to-existing-project/sql-server)

- Prisma database mapping documentation:  
  [https://www.prisma.io/docs/orm/v7/prisma-schema/data-model/database-mapping](https://www.prisma.io/docs/orm/v7/prisma-schema/data-model/database-mapping)

- Prisma relations documentation:  
  [https://www.prisma.io/docs/orm/v7/prisma-schema/data-model/relations](https://www.prisma.io/docs/orm/v7/prisma-schema/data-model/relations)

- Express-validator documentation:  
  [https://express-validator.github.io/docs/](https://express-validator.github.io/docs/)

- OpenAPI specification:  
  [https://spec.openapis.org/oas/latest.html](https://spec.openapis.org/oas/latest.html)

- Swagger bearer authentication:  
  [https://swagger.io/docs/specification/v3_0/authentication/bearer-authentication/](https://swagger.io/docs/specification/v3_0/authentication/bearer-authentication/)

- Swagger authentication:  
  [https://swagger.io/docs/specification/v3_0/authentication/](https://swagger.io/docs/specification/v3_0/authentication/)

- Swagger UI Express:  
  [https://www.npmjs.com/package/swagger-ui-express](https://www.npmjs.com/package/swagger-ui-express)