# NestJS User Management Demo

Mini backend NestJS realise pour revisiter les patterns d'un module de gestion d'utilisateurs dans un contexte de migration depuis Spring Boot.

## Stack

- NestJS
- TypeScript
- PostgreSQL
- TypeORM
- class-validator
- class-transformer

## Features

- Create user
- List users
- Get user by id
- Update user
- Delete user
- Email uniqueness check
- Basic DTO validation

## Project Structure

```text
src/
  app.module.ts
  users/
    dto/
    user.entity.ts
    users.controller.ts
    users.module.ts
    users.service.ts
```

## Local Setup

Install dependencies:

```bash
npm install
```

Start PostgreSQL with Docker:

```bash
docker run --name nest-users-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=nest_users \
  -p 5432:5432 \
  -d postgres
```

Create a `.env` file at the project root:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=nest_users
```

Start the API in development mode:

```bash
npm run start:dev
```

The API will run on `http://localhost:3000`.

## Available Scripts

```bash
npm run start
npm run start:dev
npm run start:prod
npm run build
npm run test
npm run test:e2e
npm run test:cov
npm run lint
```

## API Endpoints

```text
POST   /users
GET    /users
GET    /users/:id
PATCH  /users/:id
DELETE /users/:id
```

Example create payload:

```json
{
  "email": "ada@example.com",
  "firstName": "Ada",
  "lastName": "Lovelace",
  "status": "ACTIVE"
}
```

## Notes

- TypeORM is configured with `autoLoadEntities: true`
- TypeORM is configured with `synchronize: true` for local development
- `synchronize: true` is convenient for learning, but should not be used as-is in production
