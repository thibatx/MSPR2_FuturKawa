-- CreateTable
CREATE TABLE "exploitations" (
    "id_exploitation" BIGSERIAL NOT NULL,
    "nom" VARCHAR(100) NOT NULL,

    CONSTRAINT "exploitations_pkey" PRIMARY KEY ("id_exploitation")
);

-- CreateTable
CREATE TABLE "entrepots" (
    "id_entrepot" BIGSERIAL NOT NULL,
    "id_exploitation" BIGINT,
    "nom" VARCHAR(100),

    CONSTRAINT "entrepots_pkey" PRIMARY KEY ("id_entrepot")
);

-- CreateTable
CREATE TABLE "lots" (
    "id_lot" BIGSERIAL NOT NULL,
    "id_entrepot" BIGINT,
    "date_stockage" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "statut" VARCHAR(20),

    CONSTRAINT "lots_pkey" PRIMARY KEY ("id_lot")
);

-- CreateTable
CREATE TABLE "mesures" (
    "id_mesure" SERIAL NOT NULL,
    "id_entrepot" BIGINT,
    "temperature" DOUBLE PRECISION,
    "humidite" DOUBLE PRECISION,
    "statut" VARCHAR(20),
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mesures_pkey" PRIMARY KEY ("id_mesure")
);

-- AddForeignKey
ALTER TABLE "entrepots" ADD CONSTRAINT "entrepots_id_exploitation_fkey" FOREIGN KEY ("id_exploitation") REFERENCES "exploitations"("id_exploitation") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lots" ADD CONSTRAINT "lots_id_entrepot_fkey" FOREIGN KEY ("id_entrepot") REFERENCES "entrepots"("id_entrepot") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mesures" ADD CONSTRAINT "mesures_id_entrepot_fkey" FOREIGN KEY ("id_entrepot") REFERENCES "entrepots"("id_entrepot") ON DELETE SET NULL ON UPDATE CASCADE;
