import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Salas
  const sala1 = await prisma.sala.upsert({
    where: { numero: 1 },
    update: {},
    create: { numero: 1, capacidade: 100, tipo: 'IMAX' },
  });

  const sala2 = await prisma.sala.upsert({
    where: { numero: 2 },
    update: {},
    create: { numero: 2, capacidade: 100, tipo: '3D' },
  });

  // Assentos (A-J, 1-10)
  const fileiras = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  for (const sala of [sala1, sala2]) {
    for (const f of fileiras) {
      for (let n = 1; n <= 10; n++) {
        await prisma.assento.upsert({
          where: { idSala_fileira_numero: { idSala: sala.id, fileira: f, numero: n } },
          update: {},
          create: { idSala: sala.id, fileira: f, numero: n, tipo: 'NORMAL' },
        });
      }
    }
  }

  // Filmes
  const filmes = await Promise.all([
    prisma.filme.create({
      data: { titulo: 'Duna: Parte 2', genero: 'Ficção', duracaoMin: 166, classificacao: '14', sinopse: 'Paul Atreides se une a Chani...', posterUrl: '...' }
    }),
    prisma.filme.create({
      data: { titulo: 'Oppenheimer', genero: 'Drama', duracaoMin: 180, classificacao: '16', sinopse: 'O físico J. Robert Oppenheimer...', posterUrl: '...' }
    }),
    prisma.filme.create({
      data: { titulo: 'Pobres Criaturas', genero: 'Comédia', duracaoMin: 141, classificacao: '18', sinopse: 'A fantástica evolução de Bella Baxter...', posterUrl: '...' }
    })
  ]);

  // Sessoes
  await prisma.sessao.createMany({
    data: [
      { idSala: sala1.id, idFilme: filmes[0].id, dataHora: new Date('2026-03-01T20:00:00'), valorUnitario: 40.0, idioma: 'LEG' },
      { idSala: sala1.id, idFilme: filmes[1].id, dataHora: new Date('2026-03-01T23:30:00'), valorUnitario: 35.0, idioma: 'LEG' },
      { idSala: sala2.id, idFilme: filmes[2].id, dataHora: new Date('2026-03-01T19:00:00'), valorUnitario: 30.0, idioma: 'DUB' },
    ]
  });

  console.log('Seed finalizado com sucesso.');
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());