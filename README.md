# NestJS User Management API

Backend NestJS modulaire pour la gestion d'utilisateurs, structuré pour un contexte plus proche d'un projet d'entreprise: configuration centralisee, versioning d'API, separation controller/service/repository/mapper, et point d'entree de health check.

## Stack

- NestJS 11
- TypeScript
- PostgreSQL
- TypeORM
- `@nestjs/config`
- `@nestjs/swagger`
- `class-validator`
- `class-transformer`

## Fonctionnalites

- Creation d'utilisateur
- Liste paginee des utilisateurs
- Recuperation d'un utilisateur par id
- Mise a jour d'un utilisateur
- Suppression d'un utilisateur
- Verification d'unicite de l'email
- Validation DTO globale
- Versioning d'API en URI
- Endpoint de health check
- Swagger pour la documentation

## Architecture

```text
src/
  main.ts
  app.module.ts
  common/
    dto/
    filters/
      http-exception.filter.ts
    interceptors/
    pipes/
      validation.pipe.ts
    constants/
      app.constants.ts
  config/
    app.config.ts
    database.config.ts
  users/
    controllers/
      users.controller.ts
    services/
      users.service.ts
    repositories/
      users.repository.ts
    dto/
      create-user.dto.ts
      update-user.dto.ts
      find-users.dto.ts
      user-response.dto.ts
    entities/
      user.entity.ts
    mappers/
      user.mapper.ts
    users.module.ts
  health/
    health.controller.ts
    health.module.ts
test/
```

## Organisation des couches

- `controllers`: exposition des routes HTTP
- `services`: logique metier
- `repositories`: acces aux donnees TypeORM
- `mappers`: transformation entite -> DTO de reponse
- `config`: configuration applicative et base de donnees
- `common`: briques transverses reutilisables

Le service `users` n'utilise plus directement TypeORM dans sa logique metier. Le `Repository<User>` TypeORM est encapsule dans `UsersRepository`, ce qui isole mieux la persistence, facilite les tests, et rend le code plus evolutif.

## URLs importantes

- API base: `http://localhost:3000/api`
- API v1: `http://localhost:3000/api/v1`
- API v2: `http://localhost:3000/api/v2`
- Swagger: `http://localhost:3000/docs`
- Health check: `GET /api/v1/health`

## Endpoints disponibles

```text
POST   /api/v1/users
GET    /api/v1/users
GET    /api/v2/users?search=&page=1&limit=10
GET    /api/v1/users/:id
PATCH  /api/v1/users/:id
DELETE /api/v1/users/:id
GET    /api/v1/health
```

`GET /api/v1/users` conserve le contrat historique et retourne un tableau.
`GET /api/v2/users` ajoute la recherche et la pagination et retourne `{ data, meta }`.

## Exemple de payload

```json
{
  "email": "ada@example.com",
  "firstName": "Ada",
  "lastName": "Lovelace",
  "status": "ACTIVE"
}
```

## Setup local

Copier le fichier d'environnement :

```bash
cp .env.example .env
```

Lancer l'application et la base de donnees :

```bash
docker compose up
```

L'API est disponible sur `http://localhost:3000/api` et Swagger sur `http://localhost:3000/docs`.

Pour le developpement sans Docker :

```bash
npm install
npm run start:dev
```

## CI/CD

Le pipeline GitHub Actions (`.github/workflows/ci.yml`) se declenche a chaque push sur `main` :

1. Installation des dependances
2. Execution des tests
3. Compilation TypeScript
4. Build de l'image Docker multi-platform (amd64 + arm64)
5. Push de l'image sur GitHub Container Registry (`ghcr.io`)

L'image est disponible sur :

```
ghcr.io/komastech/nestjs-user-management-demo:latest
```

## Scripts disponibles

```bash
npm run start
npm run start:dev
npm run start:debug
npm run start:prod
npm run build
npm run test
npm run test:e2e
npm run test:cov
npm run format
npm run lint
```

## Configuration actuelle

Le bootstrap applicatif active:

- un prefix global `api`
- un versioning URI avec `v1`
- une validation globale Nest via `ValidationPipe`
- Swagger sur `/docs`

La configuration est centralisee dans:

- [src/config/app.config.ts](src/config/app.config.ts)
- [src/config/database.config.ts](src/config/database.config.ts)

## TypeORM et schema de base

Le projet utilise actuellement:

- `autoLoadEntities: true`
- `synchronize: true`

`synchronize: true` est volontairement pratique pour le developpement local car il accelere le bootstrap et evite de gerer une migration a chaque petit changement d'entite.

En environnement d'entreprise, cette option ne devrait pas etre utilisee telle quelle sur des environnements partages ou de production. La bonne approche est de passer a des migrations versionnees TypeORM afin de garantir:

- la tracabilite des changements de schema
- la reproductibilite entre dev, staging et production
- la revue de code des evolutions de base
- la securite des donnees lors des deploiements

## Gestion des erreurs

Un filtre HTTP reutilisable est present dans [src/common/filters/http-exception.filter.ts](src/common/filters/http-exception.filter.ts).

Il normalise les erreurs HTTP en JSON avec:

- `statusCode`
- `timestamp`
- `path`
- `method`
- `message`

## Tests

```bash
npm test
```

4 tests unitaires couvrent le controller et le service users.
