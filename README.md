## Live Demo

[Open Library Management System](https://library-management-system-f4xm.onrender.com/)
# Library Management System

A full-stack Library Management System developed using **Spring Boot** and a frontend application.

## Features

* Add new books
* View all books
* View a book by ID
* Update book details
* Delete books
* REST API integration
* CRUD operations

## Technologies Used

### Backend

* Java
* Spring Boot
* Spring Data JPA
* Maven

### Frontend

* HTML
* CSS
* JavaScript

## Project Structure

```text
library-management-system/
├── backend/
│   └── Spring Boot application
└── frontend/
    └── Frontend application
```

## How to Run

### Backend

```bash
cd backend
mvn spring-boot:run
```

### Frontend

Open the frontend project and run it using the appropriate development server.

## API Endpoints

| Method | Endpoint          | Purpose       |
| ------ | ----------------- | ------------- |
| POST   | `/api/books`      | Create a book |
| GET    | `/api/books`      | Get all books |
| GET    | `/api/books/{id}` | Get a book    |
| PUT    | `/api/books/{id}` | Update a book |
| DELETE | `/api/books/{id}` | Delete a book |

## Status

Project is currently working with frontend and backend integration.
