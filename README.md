# App Template — Monorepo

Template monorepo full-TypeScript : API NestJS + front Next.js, base PostgreSQL en Docker, authentification JWT (utilisateurs & admin).

## Sommaire

<details>
<summary><strong>main</strong> — Stack, structure, installation et démarrage</summary>

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
│   ├── API_Siege/      # NestJS + Prisma + JWT (siège, port 3000)
│   ├── App_Siege/      # Next.js + Tailwind (front, port 3001)
│   ├── API_Colombia/   # NestJS + Prisma (données Colombie, port 3002)
│   └── API_Brazil/     # NestJS + Prisma (données Brésil, port 3003)
├── packages/
│   └── types/          # Types TypeScript partagés
├── docker/
│   └── init/           # Scripts SQL d'init (création des bases pays)
└── docker-compose.yml  # 1 conteneur Postgres -> 3 bases
```

## Architecture multi-pays

Un **seul conteneur PostgreSQL** héberge trois bases : `FuturKawa` (siège),
`futurkawa_colombia` et `futurkawa_brazil`.

| App | Port | Base | Auth |
|---|---|---|---|
| `API_Siege` | 3000 | `FuturKawa` | JWT (USER/ADMIN) |
| `App_Siege` | 3001 | — | — |
| `API_Colombia` | 3002 | `futurkawa_colombia` | clé d'API (`x-api-key`) |
| `API_Brazil` | 3003 | `futurkawa_brazil` | clé d'API (`x-api-key`) |

Les API pays exposent les données en **lecture seule** (`exploitations`,
`entrepots`, `lots`, `mesures`). L'authentification des humains reste au siège.

**Chaîne de sécurité :**

```
Navigateur --(JWT)--> API_Siege --(x-api-key)--> API_Colombia / API_Brazil
```

`App_Siege` n'appelle jamais directement les API pays : il passe par
`API_Siege` (endpoints `/countries/:country/...`, protégés par JWT), qui ajoute
la clé d'API lors de l'appel sortant. Les clés sont définies dans les `.env`
(`API_KEY` côté pays, `COLOMBIA_API_KEY` / `BRAZIL_API_KEY` côté siège).

## Prérequis

- Node.js 20+
- Docker Desktop

## Installation

```bash
# 1. Installer toutes les dépendances du monorepo
npm install

# 2. Lancer la base PostgreSQL dans Docker (1 conteneur, 3 bases)
docker compose up -d        # (ou : npm run db:up)

# 3. Configurer les variables d'environnement
cp apps/API_Siege/.env.example    apps/API_Siege/.env
cp apps/App_Siege/.env.example    apps/App_Siege/.env.local
cp apps/API_Colombia/.env.example apps/API_Colombia/.env
cp apps/API_Brazil/.env.example   apps/API_Brazil/.env

# 4. Créer les tables (migration Prisma) pour chaque API
cd apps/API_Siege    && npx prisma migrate dev && cd ../..
cd apps/API_Colombia && npx prisma migrate dev && cd ../..
cd apps/API_Brazil   && npx prisma migrate dev && cd ../..

# 5. (optionnel) Jeu de données d'exemple pour les pays
cd apps/API_Colombia && npm run seed && cd ../..
cd apps/API_Brazil   && npm run seed && cd ../..
```

> **Note :** les bases `futurkawa_colombia` et `futurkawa_brazil` sont créées
> automatiquement par `docker/init/01-create-databases.sql` au **premier**
> démarrage du conteneur. Si le volume Postgres existe déjà, créez-les à la main :
> ```bash
> docker exec futurkawa-postgres psql -U root -d postgres \
>   -c "CREATE DATABASE futurkawa_colombia;" -c "CREATE DATABASE futurkawa_brazil;"
> ```

## Créer un compte admin

```bash
# depuis apps/API_Siege
npm run create:admin -- <email> <password> "<nom>"

# exemple
npm run create:admin -- admin@test.com password123 "Admin"
```

## Démarrer en développement

```bash
# Tout lancer en parallèle depuis la racine (Turbo)
npm run dev

# … ou app par app :
cd apps/API_Siege    && npm run dev   # http://localhost:3000/api
cd apps/App_Siege    && npm run dev   # http://localhost:3001
cd apps/API_Colombia && npm run dev   # http://localhost:3002/api
cd apps/API_Brazil   && npm run dev   # http://localhost:3003/api
```

Page de connexion : **http://localhost:3001/login**

### Tester la communication sécurisée siège ↔ pays

```bash
# 1. Récupérer un token JWT
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"password123"}' | jq -r .accessToken)

# 2. Lire les données d'un pays VIA le siège (le siège ajoute la clé d'API)
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/countries/colombia/exploitations
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/countries/brazil/mesures
```

Appeler directement une API pays sans la clé renvoie `401` :
```bash
curl http://localhost:3002/api/exploitations          # 401
curl -H "x-api-key: colombia-dev-key" http://localhost:3002/api/exploitations  # 200
```

## Arrêter la base

```bash
docker compose down         # (ou : npm run db:down)
```

</details>

<details>
<summary><strong>user-management</strong> — Gestion des utilisateurs (admin)</summary>

## Gestion des utilisateurs

Espace réservé aux administrateurs, accessible sur **http://localhost:3001/admin/users**.
La garde d'accès redirige les visiteurs non connectés vers `/login` et les utilisateurs non-admin vers `/dashboard`.

### Fonctionnalités

- **Lister** les utilisateurs (nom, email, rôle, date de création).
- **Créer** un utilisateur (email, nom optionnel, mot de passe ≥ 8 caractères, rôle USER/ADMIN).
- **Changer le rôle** : passer un utilisateur en administrateur ou le rétrograder.
- **Supprimer un utilisateur** avec une **modale de confirmation** :
  - un bouton « Supprimer » s'affiche sur chaque ligne (sauf son propre compte) ;
  - un clic ouvre une fenêtre de confirmation rappelant le nom/email visé et le caractère irréversible de l'action ;
  - la suppression n'est effectuée qu'après validation, puis la liste est rafraîchie.

### Sécurité

- Toutes les routes `/users` sont protégées par `JwtAuthGuard` + `AdminGuard` (rôle `ADMIN` requis).
- Un administrateur **ne peut pas supprimer son propre compte** : l'API renvoie une erreur `400` et le bouton est masqué côté interface.

### Endpoints API

| Méthode | Route | Description |
|---|---|---|
| `GET` | `/users` | Liste des utilisateurs |
| `POST` | `/users` | Création d'un utilisateur |
| `PATCH` | `/users/:id/role` | Modification du rôle |
| `DELETE` | `/users/:id` | Suppression d'un utilisateur |

</details>
