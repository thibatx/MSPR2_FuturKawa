# App Template — Monorepo

Template monorepo full-TypeScript : API NestJS + front Next.js, base PostgreSQL en Docker, authentification JWT (utilisateurs & admin).

## Stack principale

| Domaine | Technologie | Rôle |
|---|---|---|
| Monorepo | **Turbo** + npm workspaces | Orchestration des apps/packages |
| Backend | **NestJS 11** | API REST |
| ORM | **Prisma 6** | Accès base de données |
| Base de données | **PostgreSQL 16** (Docker) | Persistance |
| Auth | **JWT** (`@nestjs/jwt` + Passport) + **bcrypt** | Login sécurisé par token + rôles USER/ADMIN |
| Frontend | **Next.js 15** (App Router) + **React 19** | Interface web |
| Style | **TailwindCSS 3** | Design dashboard |
| Types partagés | **`@app/types`** | Types communs API ↔ Web |
| Langage | **TypeScript 5** | Partout |

## Structure

```
.
├── apps/
│   ├── api/          # NestJS + Prisma + JWT
│   └── web/          # Next.js + Tailwind
├── packages/
│   └── types/        # Types TypeScript partagés
└── docker-compose.yml
```

## Prérequis

- Node.js 20+
- Docker Desktop

## Installation

```bash
# 1. Installer toutes les dépendances du monorepo
npm install

# 2. Lancer la base PostgreSQL dans Docker
docker compose up -d        # (ou : npm run db:up)

# 3. Configurer les variables d'environnement
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local

# 4. Créer les tables (migration Prisma)
cd apps/api
npx prisma migrate dev
```

## Créer un compte admin

```bash
# depuis apps/api
npm run create:admin -- <email> <password> "<nom>"

# exemple
npm run create:admin -- admin@test.com password123 "Admin"
```

## Démarrer en développement

```bash
# API  -> http://localhost:3000/api   (depuis apps/api)
npm run dev

# Web  -> http://localhost:3001        (depuis apps/web)
npm run dev
```

Page de connexion : **http://localhost:3001/login**

## Arrêter la base

```bash
docker compose down         # (ou : npm run db:down)
```
