-- Exécuté automatiquement au tout premier démarrage du conteneur Postgres
-- (les scripts de /docker-entrypoint-initdb.d ne tournent que si le volume est vide).
-- La base du Siège (FuturKawa) est déjà créée via POSTGRES_DB.
-- On ajoute ici les deux bases des pays.
CREATE DATABASE futurkawa_colombia;
CREATE DATABASE futurkawa_brazil;
