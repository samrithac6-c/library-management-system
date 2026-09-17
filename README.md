# Library Management System

A full-stack Library Management System for academic SOP evaluation. The existing dashboard-style frontend communicates with a Java Spring Boot REST API, which persists book records in MySQL. No mock data, static JSON, browser localStorage, or in-memory permanent storage is used.

## Architecture

```text
React + TypeScript dashboard
        |
        | fetch / REST JSON
        v
Java 17 + Spring Boot 3.4 REST API
        |
        | Spring Data JPA / Hibernate
        v
MySQL 8 (library_db.books)
```

The frontend lives in `client/`. The requested Java backend lives in `backend/`. The MySQL schema and seed setup lives in `database/schema.sql`.

## Features

- Persistent book CRUD: create, list, get by ID, update, and delete.
- Search by title, author, or ISBN and filter by category using database-backed query parameters.
- Issue and return actions that update `available_quantity` transactionally.
- Frontend validation for required fields, quantity, and publication year.
- Backend Bean Validation for required fields, positive quantities, and year range.
- Unique ISBN enforcement with `409 Conflict` JSON responses.
- `404 Not Found` JSON responses for non-existing IDs.
- Centralized Spring Boot exception handling for validation, business, database, and unexpected errors.
- Dashboard summary cards, live database state indicator, add/edit/view/delete actions, and success/error feedback.

## Prerequisites

- Node.js 20+ and pnpm.
- Java 17+ (Java 21 also works).
- Maven 3.8+.
- MySQL 8+ **or** Docker with Docker Compose.

## Run locally with Docker MySQL

From the repository root:

```bash
cd backend
docker compose up -d mysql
cd ..
```

The Compose service creates `library_db`, creates `library_user`, creates the `books` table, and inserts two starter records. The backend defaults in `backend/src/main/resources/application.yml` match this setup.

## Run locally with an installed MySQL server

```bash
sudo mysql < database/schema.sql
```

If your MySQL credentials differ, set these variables before starting Spring Boot:

```bash
export DB_URL='jdbc:mysql://localhost:3306/library_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC'
export DB_USERNAME='library_user'
export DB_PASSWORD='library_password'
```

## Start the backend

```bash
cd backend
mvn spring-boot:run
```

The REST API listens on `http://localhost:8080`.

## Start the frontend

In another terminal:

```bash
pnpm install
pnpm dev
```

The frontend listens on the generated WebDev/Vite URL (usually `http://localhost:3000`). During development, `/api` is proxied to `http://localhost:8080` by `vite.config.ts`.

If the frontend and backend are hosted separately, set the API base URL when building or starting the frontend:

```bash
VITE_API_BASE_URL=http://localhost:8080 pnpm dev
```

## API endpoint documentation

All endpoints return JSON except successful delete, which returns `204 No Content`.

| Method | Endpoint | Purpose | Success |
|---|---|---|---|
| `POST` | `/api/books` | Add a book | `201 Created` |
| `GET` | `/api/books` | Get all books | `200 OK` |
| `GET` | `/api/books/{id}` | Get one book | `200 OK` |
| `PUT` | `/api/books/{id}` | Update a book | `200 OK` |
| `DELETE` | `/api/books/{id}` | Delete a book | `204 No Content` |
| `POST` | `/api/books/{id}/issue` | Issue one copy | `200 OK` |
| `POST` | `/api/books/{id}/return` | Return one copy | `200 OK` |

`GET /api/books` accepts optional database-backed filters:

```text
GET /api/books?search=clean&category=Programming
```

### Book request body

`POST` and `PUT` accept:

```json
{
  "title": "Clean Code",
  "author": "Robert C. Martin",
  "isbn": "9780132350884",
  "category": "Programming",
  "publisher": "Prentice Hall",
  "publicationYear": 2008,
  "quantity": 6
}
```

`availableQuantity` and `status` are server-managed. On create, all copies are available. On update, currently issued copies are preserved. `status` is derived from availability.

### Error response format

Validation and domain failures follow this shape:

```json
{
  "timestamp": "2026-09-17T00:05:23.118Z",
  "status": 409,
  "error": "Duplicate ISBN",
  "message": "A book with ISBN 9780132350884 already exists",
  "path": "/api/books",
  "fieldErrors": {
    "quantity": "Quantity must be greater than 0"
  }
}
```

| Condition | HTTP status |
|---|---:|
| Malformed request, missing required field, invalid ID | `400 Bad Request` |
| Book ID does not exist | `404 Not Found` |
| Duplicate ISBN | `409 Conflict` |
| Invalid issue/return or quantity reduction below issued copies | `422 Unprocessable Entity` |
| Unexpected API/database failure | `500 Internal Server Error` |

## Postman testing

Import `postman/Library-Management-System.postman_collection.json` into Postman. Set the collection variable `baseUrl` to `http://localhost:8080`. The collection includes create, list, get, update, issue, return, duplicate ISBN, missing ID, and delete examples.

The shell smoke test can also be run after MySQL and Spring Boot are up:

```bash
cd backend
./smoke-test.sh
```

It verifies the complete create → read → update → issue → return → duplicate validation → missing ID → delete flow and prints `CRUD_SMOKE_TEST=PASS` on success.

## Verification commands

```bash
# Frontend type check and production build
pnpm check
pnpm build

# Backend unit tests
cd backend
mvn test

# End-to-end API + MySQL smoke test
./smoke-test.sh
```

## Database schema

The `books` table contains:

- `id`
- `title`
- `author`
- `isbn` (unique)
- `category`
- `publisher`
- `publication_year`
- `quantity`
- `available_quantity`
- `status`

The complete setup script is in `database/schema.sql`. It also defines constraints for valid quantity, valid availability bounds, and publication years from 1000 through 2100.
