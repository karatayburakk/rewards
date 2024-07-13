import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const rewards = [
    { dayNumber: 1, coin: 10, description: 'Day 1 Reward' },
    { dayNumber: 2, coin: 20, description: 'Day 2 Reward' },
    { dayNumber: 3, coin: 30, description: 'Day 3 Reward' },
    { dayNumber: 4, coin: 40, description: 'Day 4 Reward' },
    { dayNumber: 5, coin: 50, description: 'Day 5 Reward' },
    { dayNumber: 6, coin: 60, description: 'Day 6 Reward' },
    { dayNumber: 7, coin: 70, description: 'Day 7 Reward' },
  ];

  for (const reward of rewards) {
    await prisma.reward.create({ data: reward });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
