-- CreateEnum
CREATE TYPE "Status" AS ENUM ('AVAILABLE', 'RUNNING', 'MAINTENANCE');

-- CreateTable
CREATE TABLE "machines" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'AVAILABLE',
    "startTime" TIMESTAMP(3),
    "endTime" TIMESTAMP(3),
    "duration" INTEGER NOT NULL DEFAULT 30,
    "price" DECIMAL(65,30) NOT NULL DEFAULT 20.00,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "machines_pkey" PRIMARY KEY ("id")
);
