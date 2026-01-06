import { prisma } from "./prisma/client";

async function test() {
  const part = await prisma.part.create({
    data: {
      name: "Filtro de Óleo",
      code: "FLT-001",
      category: "Motor",
      quantity: 10,
      minQuantity: 3,
      price: 35.5,
      supplier: "Fornecedor Teste",
      location: "A1",
    },
  });

  console.log("✔ Inserido:", part);
}

test()
  .catch((e) => {
    console.error("❌ Erro Prisma:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
