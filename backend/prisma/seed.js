require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { addDays, setHours, setMinutes } = require('date-fns');

const prisma = new PrismaClient();

async function main() {
  console.log('Limpando banco de dados...');
  await prisma.appointment.deleteMany();
  await prisma.workingHours.deleteMany();
  await prisma.service.deleteMany();
  await prisma.establishment.deleteMany();
  await prisma.user.deleteMany();

  console.log('Criando usuários...');

  const admin = await prisma.user.create({
    data: {
      name: 'Admin Sistema',
      email: 'admin@agendafacil.com',
      password: await bcrypt.hash('admin123', 10),
      phone: '(11) 99999-0000',
      role: 'ADMIN',
    },
  });

  const provider1 = await prisma.user.create({
    data: {
      name: 'João Silva',
      email: 'joao@salao.com',
      password: await bcrypt.hash('provider123', 10),
      phone: '(11) 98888-1111',
      role: 'PROVIDER',
    },
  });

  const provider2 = await prisma.user.create({
    data: {
      name: 'Maria Santos',
      email: 'maria@petshop.com',
      password: await bcrypt.hash('provider123', 10),
      phone: '(11) 97777-2222',
      role: 'PROVIDER',
    },
  });

  const client1 = await prisma.user.create({
    data: {
      name: 'Carlos Oliveira',
      email: 'carlos@email.com',
      password: await bcrypt.hash('client123', 10),
      phone: '(11) 96666-3333',
      role: 'CLIENT',
    },
  });

  const client2 = await prisma.user.create({
    data: {
      name: 'Ana Costa',
      email: 'ana@email.com',
      password: await bcrypt.hash('client123', 10),
      phone: '(11) 95555-4444',
      role: 'CLIENT',
    },
  });

  console.log('Criando estabelecimentos...');

  const salon = await prisma.establishment.create({
    data: {
      name: 'Salão Beleza Total',
      description: 'O melhor salão de beleza da região. Cortes, colorações e tratamentos capilares.',
      category: 'SALON',
      address: 'Rua das Flores, 123 - Centro',
      phone: '(11) 3333-1111',
      ownerId: provider1.id,
    },
  });

  const petshop = await prisma.establishment.create({
    data: {
      name: 'PetShop Animais Felizes',
      description: 'Cuidamos do seu pet com amor. Banho, tosa e veterinário.',
      category: 'PETSHOP',
      address: 'Av. dos Animais, 456 - Jardim',
      phone: '(11) 3333-2222',
      ownerId: provider2.id,
    },
  });

  console.log('Criando serviços...');

  const salonServices = await Promise.all([
    prisma.service.create({
      data: {
        name: 'Corte Feminino',
        description: 'Corte e finalização para cabelos femininos',
        duration: 60,
        price: 80.0,
        establishmentId: salon.id,
      },
    }),
    prisma.service.create({
      data: {
        name: 'Coloração',
        description: 'Coloração completa com produtos de alta qualidade',
        duration: 120,
        price: 150.0,
        establishmentId: salon.id,
      },
    }),
    prisma.service.create({
      data: {
        name: 'Manicure',
        description: 'Manicure e pedicure completo',
        duration: 45,
        price: 45.0,
        establishmentId: salon.id,
      },
    }),
  ]);

  const petServices = await Promise.all([
    prisma.service.create({
      data: {
        name: 'Banho Pequeno Porte',
        description: 'Banho completo para cães de pequeno porte',
        duration: 60,
        price: 55.0,
        establishmentId: petshop.id,
      },
    }),
    prisma.service.create({
      data: {
        name: 'Banho e Tosa',
        description: 'Banho e tosa para todos os portes',
        duration: 90,
        price: 85.0,
        establishmentId: petshop.id,
      },
    }),
    prisma.service.create({
      data: {
        name: 'Consulta Veterinária',
        description: 'Consulta geral com veterinário',
        duration: 30,
        price: 120.0,
        establishmentId: petshop.id,
      },
    }),
  ]);

  console.log('Criando horários de funcionamento...');

  const workingDays = [
    { dayOfWeek: 1, startTime: '08:00', endTime: '18:00' },
    { dayOfWeek: 2, startTime: '08:00', endTime: '18:00' },
    { dayOfWeek: 3, startTime: '08:00', endTime: '18:00' },
    { dayOfWeek: 4, startTime: '08:00', endTime: '18:00' },
    { dayOfWeek: 5, startTime: '08:00', endTime: '18:00' },
    { dayOfWeek: 6, startTime: '08:00', endTime: '12:00' },
  ];

  for (const day of workingDays) {
    await prisma.workingHours.create({ data: { ...day, establishmentId: salon.id } });
    await prisma.workingHours.create({ data: { ...day, establishmentId: petshop.id } });
  }

  console.log('Criando agendamentos...');

  const tomorrow = addDays(new Date(), 1);
  const nextWeek = addDays(new Date(), 7);
  const yesterday = addDays(new Date(), -1);

  function makeDateTime(base, hour, minute = 0) {
    return setMinutes(setHours(base, hour), minute);
  }

  await prisma.appointment.create({
    data: {
      clientId: client1.id,
      serviceId: salonServices[0].id,
      establishmentId: salon.id,
      dateTime: makeDateTime(tomorrow, 9),
      endTime: makeDateTime(tomorrow, 10),
      status: 'CONFIRMED',
      notes: 'Prefiro franja lateral',
    },
  });

  await prisma.appointment.create({
    data: {
      clientId: client2.id,
      serviceId: salonServices[2].id,
      establishmentId: salon.id,
      dateTime: makeDateTime(tomorrow, 11),
      endTime: makeDateTime(tomorrow, 11, 45),
      status: 'PENDING',
    },
  });

  await prisma.appointment.create({
    data: {
      clientId: client1.id,
      serviceId: petServices[0].id,
      establishmentId: petshop.id,
      dateTime: makeDateTime(nextWeek, 10),
      endTime: makeDateTime(nextWeek, 11),
      status: 'PENDING',
      notes: 'Golden Retriever, muito dócil',
    },
  });

  await prisma.appointment.create({
    data: {
      clientId: client2.id,
      serviceId: petServices[2].id,
      establishmentId: petshop.id,
      dateTime: makeDateTime(yesterday, 14),
      endTime: makeDateTime(yesterday, 14, 30),
      status: 'COMPLETED',
    },
  });

  await prisma.appointment.create({
    data: {
      clientId: client1.id,
      serviceId: salonServices[1].id,
      establishmentId: salon.id,
      dateTime: makeDateTime(yesterday, 15),
      endTime: makeDateTime(yesterday, 17),
      status: 'COMPLETED',
      notes: 'Cor: loiro caramelo',
    },
  });

  console.log('\n✓ Seed concluído com sucesso!\n');
  console.log('Usuários criados:');
  console.log('  Admin:     admin@agendafacil.com   / admin123');
  console.log('  Provider1: joao@salao.com           / provider123');
  console.log('  Provider2: maria@petshop.com        / provider123');
  console.log('  Client1:   carlos@email.com         / client123');
  console.log('  Client2:   ana@email.com            / client123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
