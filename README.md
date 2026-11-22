# NestJS User Management API

Backend NestJS modulaire pour la gestion d'utilisateurs, structuré pour un contexte plus proche d'un projet d'entreprise : configuration centralisée, versioning d'API, séparation controller/service/repository/mapper, et point d'entrée de health check.

## Stack

- NestJS 11
- TypeScript
- PostgreSQL
- TypeORM
- `@nestjs/config`
- `@nestjs/swagger`
- `class-validator`
- `class-transformer`

## Fonctionnalités

- Création d'utilisateur
- Liste des utilisateurs (v1) et liste paginée avec recherche (v2)
- Récupération d'un utilisateur par id
- Mise à jour d'un utilisateur
- Suppression d'un utilisateur
- Vérification d'unicité de l'email (insensible à la casse)
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

- `controllers` : exposition des routes HTTP
- `services` : logique métier
- `repositories` : accès aux données TypeORM
- `mappers` : transformation entité -> DTO de réponse
- `config` : configuration applicative et base de données
- `common` : briques transverses réutilisables

Le service `users` n'utilise pas directement TypeORM dans sa logique métier. Le `Repository<User>` TypeORM est encapsule dans `UsersRepository`, ce qui isole mieux la persistance, facilite les tests et rend le code plus évolutif.

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

### Avec Docker

Lancer l'application et la base de données :

```bash
docker compose up
```

Le service `app` utilise l'image publiée `ghcr.io/komastech/nestjs-user-management-demo:latest` (et non le code local) ; les variables d'environnement sont définies directement dans `docker-compose.yml`.

L'API est disponible sur `http://localhost:3000/api` et Swagger sur `http://localhost:3000/docs`.

### En développement local

Copier le fichier d'environnement, démarrer uniquement PostgreSQL via Docker, puis lancer l'application en mode watch :

```bash
cp .env.example .env
docker compose up -d db
npm install
npm run start:dev
```

## CI/CD

Le pipeline GitHub Actions (`.github/workflows/ci.yml`) se déclenche à chaque push et pull request sur `main` :

1. Installation des dépendances
2. Exécution des tests
3. Compilation TypeScript
4. Build de l'image Docker multi-plateforme (amd64 + arm64) et push sur GitHub Container Registry (`ghcr.io`) — uniquement sur push, pas sur pull request

L'image est taguée avec le SHA du commit et `latest` :

```text
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
npm run test:watch
npm run test:e2e
npm run test:cov
npm run format
npm run lint
```

## Configuration actuelle

Le bootstrap applicatif ([src/main.ts](src/main.ts)) active :

- un préfixe global `api`
- un versioning URI avec `v1` comme version par défaut
- une validation globale Nest via `ValidationPipe` (`whitelist`, `forbidNonWhitelisted`, `transform`)
- Swagger sur `/docs`

La configuration est centralisée dans :

- [src/config/app.config.ts](src/config/app.config.ts)
- [src/config/database.config.ts](src/config/database.config.ts)

À noter : le port (`3000`) et le chemin Swagger (`docs`) sont pour l'instant codés en dur dans `main.ts` ; les variables `PORT` et `SWAGGER_PATH` de `app.config.ts` ne sont pas encore utilisées.

## TypeORM et schéma de base

Le projet utilise actuellement :

- `autoLoadEntities: true`
- `synchronize: true`

`synchronize: true` est volontairement pratique pour le développement local car il accélère le bootstrap et évite de gérer une migration à chaque petit changement d'entité.

En environnement d'entreprise, cette option ne devrait pas être utilisée telle quelle sur des environnements partagés ou de production. La bonne approche est de passer à des migrations versionnées TypeORM afin de garantir :

- la traçabilité des changements de schéma
- la reproductibilité entre dev, staging et production
- la revue de code des évolutions de base
- la sécurité des données lors des déploiements

## Gestion des erreurs

Un filtre HTTP réutilisable est présent dans [src/common/filters/http-exception.filter.ts](src/common/filters/http-exception.filter.ts).

Il normalise les erreurs HTTP en JSON avec :

- `statusCode`
- `timestamp`
- `path`
- `method`
- `message`

Ce filtre n'est pas encore enregistré globalement (ni via `app.useGlobalFilters`, ni via `APP_FILTER`) : les erreurs suivent donc pour l'instant le format par défaut de NestJS.

## Tests

```bash
npm test          # tests unitaires
npm run test:e2e  # tests end-to-end
```

4 tests unitaires portent sur le module users : 3 sur le controller (dont les listes v1 et v2) et 1 test de définition du service. Un test e2e vérifie l'endpoint de health check.
