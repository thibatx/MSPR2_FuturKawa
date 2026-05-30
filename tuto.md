## Docker — 1 conteneur, 3 bases

docker-compose.yml monte docker/init/ dans /docker-entrypoint-initdb.d
docker/init/01-create-databases.sql crée futurkawa_colombia + futurkawa_brazil au 1er démarrage (volume vide). Comme ton volume existait déjà, je les ai créées à la main.  

## Deux nouvelles API (même stack : NestJS 11 + Prisma 6 + TS)

apps/API_Colombia (port 3002, base futurkawa_colombia)
apps/API_Brazil (port 3003, base futurkawa_brazil)
Schéma MSPR_2.sql traduit MySQL → PostgreSQL/Prisma (exploitations, entrepots, lots, mesures)
Endpoints lecture seule : GET /exploitations|entrepots|lots|mesures
Pas d'auth utilisateur — protégées par une clé (x-api-key) via un ApiKeyGuard global ; /health reste public
Migrations initiales + jeu de données d'exemple (npm run seed)

## Communication sécurisée siège → pays

Module countries dans API_Siege : endpoints GET /countries/:country/... protégés par JWT, qui relaient vers l'API pays en ajoutant la x-api-key.
Chaîne : Navigateur --(JWT)--> API_Siege --(x-api-key)--> API_Colombia/Brazil

Points à connaître
Détail monorepo Prisma : les 3 schémas partageant un seul @prisma/client hoisté, chaque API génère son client dans src/generated/prisma (gitignoré) ; Nest le copie dans dist via assets dans nest-cli.json. C'est pour ça que j'ai aussi dû repointer les imports @prisma/client du siège.
J'ai arrêté tes 6 process node (les dev servers du projet verrouillaient dist/.next) — pense à relancer npm run dev quand tu veux.
Rien n'est commité (je te laisse la main).
J'ai créé un user de test chain-test2@futurkawa.dev dans la base du siège pendant les tests — tu peux le supprimer.





## Pour les données qui sont dans les bdd futurkawa_colombia et futurkawa_brazil C'est des seeds prisma ?

Non, c'est un script TypeScript exécuté via ts-node, pas un seed Prisma natif. La différence :

Ce que j'ai fait — un script manuel prisma/seed.ts lancé avec :

npm run seed  # = ts-node prisma/seed.ts
Un seed Prisma natif ce serait dans package.json :

"prisma": {
  "seed": "ts-node prisma/seed.ts"
}
Ce qui permet de le lancer avec npx prisma db seed, et surtout de le lier à prisma migrate reset (Prisma re-seed automatiquement après un reset).

Tu veux que je configure les deux apps pour utiliser le seed Prisma natif ? Ça prend 2 minutes — j'ajoute le bloc "prisma" dans les package.json et je mets à jour les scripts.