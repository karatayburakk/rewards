-- CreateTable
CREATE TABLE "Reward" (
    "id" SERIAL NOT NULL,
    "dayNumber" INTEGER NOT NULL,
    "coin" INTEGER NOT NULL,
    "description" TEXT,

    CONSTRAINT "Reward_pkey" PRIMARY KEY ("id")
);
