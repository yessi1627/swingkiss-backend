-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Usuario" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "tipoCuenta" TEXT NOT NULL,
    "rol" TEXT NOT NULL DEFAULT 'gratis',
    "fechaRegistro" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "edad" INTEGER,
    "ubicacion" TEXT,
    "lat" REAL,
    "lng" REAL,
    "bio" TEXT,
    "interesesJson" TEXT,
    "verificado" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_Usuario" ("bio", "edad", "email", "fechaRegistro", "id", "interesesJson", "lat", "lng", "nombre", "passwordHash", "tipoCuenta", "ubicacion", "verificado") SELECT "bio", "edad", "email", "fechaRegistro", "id", "interesesJson", "lat", "lng", "nombre", "passwordHash", "tipoCuenta", "ubicacion", "verificado" FROM "Usuario";
DROP TABLE "Usuario";
ALTER TABLE "new_Usuario" RENAME TO "Usuario";
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
