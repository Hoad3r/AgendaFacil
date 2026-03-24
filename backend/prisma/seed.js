require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { addDays, subDays, setHours, setMinutes } = require('date-fns');

const prisma = new PrismaClient();

function dt(base, hour, minute = 0) {
  return setMinutes(setHours(base, hour), minute);
}

async function createUser(data) {
  const { password, ...userData } = data;
  const user = await prisma.user.create({ data: { ...userData, emailVerified: true } });
  if (password) {
    await prisma.account.create({
      data: {
        accountId: user.id,
        providerId: 'credential',
        userId: user.id,
        password: await bcrypt.hash(password, 10),
      },
    });
  }
  return user;
}

async function addWorkingHours(establishmentId, days) {
  await prisma.workingHours.createMany({ data: days.map((d) => ({ ...d, establishmentId })) });
}

async function main() {
  console.log('Limpando banco...');
  await prisma.rating.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.workingHours.deleteMany();
  await prisma.service.deleteMany();
  await prisma.establishment.deleteMany();
  await prisma.account.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  console.log('Criando usuários...');

  const admin = await createUser({
    name: 'Admin Sistema',
    email: 'admin@agendafacil.com',
    password: 'admin123',
    phone: '(11) 99999-0000',
    role: 'ADMIN',
  });

  const [p1, p2, p3, p4, p5, p6] = await Promise.all([
    createUser({ name: 'João Silva', email: 'joao@salao.com', password: 'provider123', phone: '(11) 98888-1111', role: 'PROVIDER' }),
    createUser({ name: 'Maria Santos', email: 'maria@petshop.com', password: 'provider123', phone: '(11) 97777-2222', role: 'PROVIDER' }),
    createUser({ name: 'Dra. Ana Ferreira', email: 'ana@clinica.com', password: 'provider123', phone: '(11) 96666-3333', role: 'PROVIDER' }),
    createUser({ name: 'Roberto Barbosa', email: 'roberto@barbearia.com', password: 'provider123', phone: '(11) 95555-4444', role: 'PROVIDER' }),
    createUser({ name: 'Carla Estética', email: 'carla@spa.com', password: 'provider123', phone: '(11) 94444-5555', role: 'PROVIDER' }),
    createUser({ name: 'Lucas PetCare', email: 'lucas@petcare.com', password: 'provider123', phone: '(11) 93333-6666', role: 'PROVIDER' }),
  ]);

  const [c1, c2, c3] = await Promise.all([
    createUser({ name: 'Carlos Oliveira', email: 'carlos@email.com', password: 'client123', phone: '(11) 92222-7777', role: 'CLIENT' }),
    createUser({ name: 'Beatriz Lima', email: 'beatriz@email.com', password: 'client123', phone: '(11) 91111-8888', role: 'CLIENT' }),
    createUser({ name: 'Fernando Costa', email: 'fernando@email.com', password: 'client123', phone: '(11) 90000-9999', role: 'CLIENT' }),
  ]);

  console.log('Criando estabelecimentos...');

  const weekdays = [
    { dayOfWeek: 1, startTime: '08:00', endTime: '18:00' },
    { dayOfWeek: 2, startTime: '08:00', endTime: '18:00' },
    { dayOfWeek: 3, startTime: '08:00', endTime: '18:00' },
    { dayOfWeek: 4, startTime: '08:00', endTime: '18:00' },
    { dayOfWeek: 5, startTime: '08:00', endTime: '18:00' },
    { dayOfWeek: 6, startTime: '08:00', endTime: '13:00' },
  ];

  // ── Salão Glamour ────────────────────────────────────────────
  const salon = await prisma.establishment.create({
    data: {
      name: 'Studio Glamour',
      description: 'Salão de beleza premium especializado em coloração, cortes modernos e tratamentos capilares. Ambiente sofisticado com profissionais experientes.',
      category: 'SALON',
      address: 'Rua das Flores, 123 - Centro, São Paulo',
      phone: '(11) 3333-1111',
      coverImage: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80',
      gallery: [
        'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80',
        'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=600&q=80',
      ],
      ownerId: p1.id,
    },
  });
  await addWorkingHours(salon.id, weekdays);
  const salonSvcs = await Promise.all([
    prisma.service.create({ data: { name: 'Corte Feminino', description: 'Corte e finalização para cabelos femininos', duration: 60, price: 95.0, establishmentId: salon.id } }),
    prisma.service.create({ data: { name: 'Corte Masculino', description: 'Corte moderno com acabamento', duration: 30, price: 55.0, establishmentId: salon.id } }),
    prisma.service.create({ data: { name: 'Coloração Completa', description: 'Coloração com produtos de alta qualidade L\'Oréal', duration: 120, price: 180.0, establishmentId: salon.id } }),
    prisma.service.create({ data: { name: 'Escova Progressiva', description: 'Tratamento de alisamento com duração de 4 a 6 meses', duration: 180, price: 280.0, establishmentId: salon.id } }),
    prisma.service.create({ data: { name: 'Manicure e Pedicure', description: 'Manicure e pedicure completos com esmaltação gel', duration: 90, price: 70.0, establishmentId: salon.id } }),
  ]);

  // ── PetShop Animais Felizes ───────────────────────────────────
  const petshop = await prisma.establishment.create({
    data: {
      name: 'PetShop Animais Felizes',
      description: 'Cuidamos do seu pet com todo o carinho que ele merece. Banho, tosa, veterinário e pet shop completo.',
      category: 'PETSHOP',
      address: 'Av. dos Animais, 456 - Jardim Paulista, São Paulo',
      phone: '(11) 3333-2222',
      coverImage: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&q=80',
      gallery: [
        'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600&q=80',
      ],
      ownerId: p2.id,
    },
  });
  await addWorkingHours(petshop.id, weekdays);
  const petSvcs = await Promise.all([
    prisma.service.create({ data: { name: 'Banho Pequeno Porte', description: 'Banho completo para cães até 10kg', duration: 60, price: 60.0, establishmentId: petshop.id } }),
    prisma.service.create({ data: { name: 'Banho Médio/Grande Porte', description: 'Banho completo para cães acima de 10kg', duration: 90, price: 90.0, establishmentId: petshop.id } }),
    prisma.service.create({ data: { name: 'Banho e Tosa Higiênica', description: 'Banho com tosa higiênica para todos os portes', duration: 90, price: 100.0, establishmentId: petshop.id } }),
    prisma.service.create({ data: { name: 'Tosa Completa', description: 'Tosa no padrão da raça ou ao gosto do cliente', duration: 120, price: 130.0, establishmentId: petshop.id } }),
    prisma.service.create({ data: { name: 'Consulta Veterinária', description: 'Consulta geral com Dr. Lucas, CRMV 12345', duration: 30, price: 130.0, establishmentId: petshop.id } }),
  ]);

  // ── Clínica Saúde Plena ──────────────────────────────────────
  const clinic = await prisma.establishment.create({
    data: {
      name: 'Clínica Saúde Plena',
      description: 'Clínica multidisciplinar com atendimento em medicina geral, dermatologia e nutrição. Equipe qualificada e estrutura moderna.',
      category: 'CLINIC',
      address: 'Rua da Saúde, 789 - Vila Nova, São Paulo',
      phone: '(11) 3333-3333',
      coverImage: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&q=80',
      gallery: [],
      ownerId: p3.id,
    },
  });
  await addWorkingHours(clinic.id, [
    { dayOfWeek: 1, startTime: '07:00', endTime: '19:00' },
    { dayOfWeek: 2, startTime: '07:00', endTime: '19:00' },
    { dayOfWeek: 3, startTime: '07:00', endTime: '19:00' },
    { dayOfWeek: 4, startTime: '07:00', endTime: '19:00' },
    { dayOfWeek: 5, startTime: '07:00', endTime: '19:00' },
  ]);
  const clinicSvcs = await Promise.all([
    prisma.service.create({ data: { name: 'Consulta Clínica Geral', description: 'Consulta com clínico geral, Dra. Ana Ferreira', duration: 30, price: 180.0, establishmentId: clinic.id } }),
    prisma.service.create({ data: { name: 'Consulta Dermatológica', description: 'Avaliação de pele, cabelo e unhas', duration: 45, price: 250.0, establishmentId: clinic.id } }),
    prisma.service.create({ data: { name: 'Consulta Nutricional', description: 'Avaliação nutricional e plano alimentar personalizado', duration: 60, price: 200.0, establishmentId: clinic.id } }),
    prisma.service.create({ data: { name: 'Check-up Básico', description: 'Exame físico geral + pedido de exames laboratoriais', duration: 45, price: 220.0, establishmentId: clinic.id } }),
  ]);

  // ── Barbearia do Rei ─────────────────────────────────────────
  const barber = await prisma.establishment.create({
    data: {
      name: 'Barbearia do Rei',
      description: 'Barbearia tradicional com toque moderno. Corte, barba e bigode com profissionais especializados. Ambiente descontraído.',
      category: 'SALON',
      address: 'Rua dos Barbeiros, 55 - Bela Vista, São Paulo',
      phone: '(11) 3333-4444',
      coverImage: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&q=80',
      gallery: [
        'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=600&q=80',
      ],
      ownerId: p4.id,
    },
  });
  await addWorkingHours(barber.id, [
    { dayOfWeek: 1, startTime: '09:00', endTime: '20:00' },
    { dayOfWeek: 2, startTime: '09:00', endTime: '20:00' },
    { dayOfWeek: 3, startTime: '09:00', endTime: '20:00' },
    { dayOfWeek: 4, startTime: '09:00', endTime: '20:00' },
    { dayOfWeek: 5, startTime: '09:00', endTime: '20:00' },
    { dayOfWeek: 6, startTime: '09:00', endTime: '18:00' },
  ]);
  const barberSvcs = await Promise.all([
    prisma.service.create({ data: { name: 'Corte Masculino', description: 'Corte na máquina ou tesoura com acabamento', duration: 30, price: 45.0, establishmentId: barber.id } }),
    prisma.service.create({ data: { name: 'Corte + Barba', description: 'Combo corte e barba com toalha quente', duration: 60, price: 75.0, establishmentId: barber.id } }),
    prisma.service.create({ data: { name: 'Barba Completa', description: 'Barba com navalha, toalha quente e bálsamo', duration: 30, price: 40.0, establishmentId: barber.id } }),
    prisma.service.create({ data: { name: 'Sobrancelha Masculina', description: 'Design de sobrancelha masculina', duration: 15, price: 20.0, establishmentId: barber.id } }),
  ]);

  // ── Espaço Zen Spa ───────────────────────────────────────────
  const spa = await prisma.establishment.create({
    data: {
      name: 'Espaço Zen Spa & Estética',
      description: 'Espaço dedicado ao relaxamento e bem-estar. Massagens, tratamentos estéticos e rituais de beleza em ambiente tranquilo e aconchegante.',
      category: 'OTHER',
      address: 'Alameda das Palmeiras, 321 - Moema, São Paulo',
      phone: '(11) 3333-5555',
      coverImage: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=80',
      gallery: [
        'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&q=80',
      ],
      ownerId: p5.id,
    },
  });
  await addWorkingHours(spa.id, [
    { dayOfWeek: 1, startTime: '10:00', endTime: '20:00' },
    { dayOfWeek: 2, startTime: '10:00', endTime: '20:00' },
    { dayOfWeek: 3, startTime: '10:00', endTime: '20:00' },
    { dayOfWeek: 4, startTime: '10:00', endTime: '20:00' },
    { dayOfWeek: 5, startTime: '10:00', endTime: '20:00' },
    { dayOfWeek: 6, startTime: '10:00', endTime: '16:00' },
  ]);
  const spaSvcs = await Promise.all([
    prisma.service.create({ data: { name: 'Massagem Relaxante 60min', description: 'Massagem relaxante com óleos essenciais', duration: 60, price: 150.0, establishmentId: spa.id } }),
    prisma.service.create({ data: { name: 'Massagem Relaxante 90min', description: 'Massagem relaxante completa com pedras quentes', duration: 90, price: 210.0, establishmentId: spa.id } }),
    prisma.service.create({ data: { name: 'Limpeza de Pele', description: 'Limpeza de pele profunda com extração e máscara', duration: 75, price: 130.0, establishmentId: spa.id } }),
    prisma.service.create({ data: { name: 'Design de Sobrancelha', description: 'Design com henna e modelagem fio a fio', duration: 45, price: 80.0, establishmentId: spa.id } }),
    prisma.service.create({ data: { name: 'Depilação com Cera', description: 'Depilação completa pernas e axilas', duration: 60, price: 90.0, establishmentId: spa.id } }),
  ]);

  // ── PetCare Premium ──────────────────────────────────────────
  const petcare = await prisma.establishment.create({
    data: {
      name: 'PetCare Premium',
      description: 'Serviços premium para o seu pet. Hotel para pets, day care, adestramento e grooming com produtos naturais e orgânicos.',
      category: 'PETSHOP',
      address: 'Rua dos Pets, 100 - Pinheiros, São Paulo',
      phone: '(11) 3333-6666',
      coverImage: 'https://images.unsplash.com/photo-1601758125946-6ec2ef64daf8?w=800&q=80',
      gallery: [],
      ownerId: p6.id,
    },
  });
  await addWorkingHours(petcare.id, [
    { dayOfWeek: 1, startTime: '07:00', endTime: '19:00' },
    { dayOfWeek: 2, startTime: '07:00', endTime: '19:00' },
    { dayOfWeek: 3, startTime: '07:00', endTime: '19:00' },
    { dayOfWeek: 4, startTime: '07:00', endTime: '19:00' },
    { dayOfWeek: 5, startTime: '07:00', endTime: '19:00' },
    { dayOfWeek: 6, startTime: '08:00', endTime: '17:00' },
  ]);
  const petcareSvcs = await Promise.all([
    prisma.service.create({ data: { name: 'Banho Natural (orgânico)', description: 'Banho com produtos naturais e orgânicos, sem parabenos', duration: 75, price: 85.0, establishmentId: petcare.id } }),
    prisma.service.create({ data: { name: 'Grooming Completo', description: 'Banho, tosa, limpeza de ouvido, corte de unhas e perfumação', duration: 150, price: 160.0, establishmentId: petcare.id } }),
    prisma.service.create({ data: { name: 'Day Care (diária)', description: 'Cuidado durante o dia com atividades e socialização', duration: 480, price: 80.0, establishmentId: petcare.id } }),
    prisma.service.create({ data: { name: 'Adestramento Básico', description: 'Sessão de adestramento para comandos básicos', duration: 60, price: 120.0, establishmentId: petcare.id } }),
  ]);

  console.log('Criando agendamentos e avaliações...');

  const past1 = subDays(new Date(), 10);
  const past2 = subDays(new Date(), 7);
  const past3 = subDays(new Date(), 3);
  const tomorrow = addDays(new Date(), 1);
  const nextWeek = addDays(new Date(), 5);

  // Agendamentos concluídos (para gerar avaliações)
  const appt1 = await prisma.appointment.create({
    data: { clientId: c1.id, serviceId: salonSvcs[0].id, establishmentId: salon.id, dateTime: dt(past1, 10), endTime: dt(past1, 11), status: 'COMPLETED', notes: 'Franja lateral, corte em camadas' },
  });
  const appt2 = await prisma.appointment.create({
    data: { clientId: c2.id, serviceId: salonSvcs[2].id, establishmentId: salon.id, dateTime: dt(past2, 14), endTime: dt(past2, 16), status: 'COMPLETED' },
  });
  const appt3 = await prisma.appointment.create({
    data: { clientId: c3.id, serviceId: barberSvcs[1].id, establishmentId: barber.id, dateTime: dt(past1, 11), endTime: dt(past1, 12), status: 'COMPLETED' },
  });
  const appt4 = await prisma.appointment.create({
    data: { clientId: c1.id, serviceId: petSvcs[0].id, establishmentId: petshop.id, dateTime: dt(past3, 9), endTime: dt(past3, 10), status: 'COMPLETED', notes: 'Golden Retriever, muito dócil' },
  });
  const appt5 = await prisma.appointment.create({
    data: { clientId: c2.id, serviceId: spaSvcs[0].id, establishmentId: spa.id, dateTime: dt(past2, 15), endTime: dt(past2, 16), status: 'COMPLETED' },
  });
  const appt6 = await prisma.appointment.create({
    data: { clientId: c3.id, serviceId: clinicSvcs[0].id, establishmentId: clinic.id, dateTime: dt(past3, 8), endTime: dt(past3, 8, 30), status: 'COMPLETED' },
  });
  const appt7 = await prisma.appointment.create({
    data: { clientId: c1.id, serviceId: barberSvcs[0].id, establishmentId: barber.id, dateTime: dt(past3, 16), endTime: dt(past3, 16, 30), status: 'COMPLETED' },
  });
  const appt8 = await prisma.appointment.create({
    data: { clientId: c2.id, serviceId: petcareSvcs[1].id, establishmentId: petcare.id, dateTime: dt(past1, 8), endTime: dt(past1, 10, 30), status: 'COMPLETED', notes: 'Poodle, tosa padrão da raça' },
  });

  // Agendamentos futuros
  await prisma.appointment.createMany({
    data: [
      { clientId: c1.id, serviceId: salonSvcs[3].id, establishmentId: salon.id, dateTime: dt(tomorrow, 9), endTime: dt(tomorrow, 12), status: 'CONFIRMED' },
      { clientId: c2.id, serviceId: barberSvcs[1].id, establishmentId: barber.id, dateTime: dt(tomorrow, 14), endTime: dt(tomorrow, 15), status: 'PENDING' },
      { clientId: c3.id, serviceId: petSvcs[4].id, establishmentId: petshop.id, dateTime: dt(nextWeek, 10), endTime: dt(nextWeek, 10, 30), status: 'PENDING', notes: 'Gato persa, muito nervoso' },
      { clientId: c1.id, serviceId: spaSvcs[1].id, establishmentId: spa.id, dateTime: dt(nextWeek, 15), endTime: dt(nextWeek, 16, 30), status: 'CONFIRMED' },
    ],
  });

  // Avaliações
  await prisma.rating.createMany({
    data: [
      { score: 5, comment: 'Atendimento impecável! A Joana arrasou no corte, saí amando. Super recomendo o Studio Glamour!', clientId: c1.id, establishmentId: salon.id, appointmentId: appt1.id },
      { score: 4, comment: 'Ótima coloração, resultado lindo. Demorou um pouco mais do esperado, mas valeu a pena.', clientId: c2.id, establishmentId: salon.id, appointmentId: appt2.id },
      { score: 5, comment: 'Melhor barbearia que já fui! Ambiente ótimo, atendimento rápido e preço justo. Voltarei sempre.', clientId: c3.id, establishmentId: barber.id, appointmentId: appt3.id },
      { score: 5, comment: 'Meu dog adorou! Chegou cheiroso, limpo e com o laço. Muito cuidadosos com os animais.', clientId: c1.id, establishmentId: petshop.id, appointmentId: appt4.id },
      { score: 5, comment: 'Massagem incrível! Ambiente super relaxante, saí renovada. Já agendei para o próximo mês.', clientId: c2.id, establishmentId: spa.id, appointmentId: appt5.id },
      { score: 4, comment: 'Dra. Ana é muito atenciosa e explica tudo direitinho. Único ponto foi a espera de 15min.', clientId: c3.id, establishmentId: clinic.id, appointmentId: appt6.id },
      { score: 5, comment: 'Corte perfeito como sempre. Pessoal muito simpático e o ambiente é super agradável.', clientId: c1.id, establishmentId: barber.id, appointmentId: appt7.id },
      { score: 5, comment: 'Serviço premium de verdade! Minha poodle ficou linda e cheirosa. Os produtos naturais são excelentes.', clientId: c2.id, establishmentId: petcare.id, appointmentId: appt8.id },
    ],
  });

  console.log('\n✓ Seed concluído!\n');
  console.log('Logins disponíveis:');
  console.log('  admin@agendafacil.com  / admin123');
  console.log('  joao@salao.com         / provider123');
  console.log('  maria@petshop.com      / provider123');
  console.log('  ana@clinica.com        / provider123');
  console.log('  roberto@barbearia.com  / provider123');
  console.log('  carla@spa.com          / provider123');
  console.log('  lucas@petcare.com      / provider123');
  console.log('  carlos@email.com       / client123');
  console.log('  beatriz@email.com      / client123');
  console.log('  fernando@email.com     / client123');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
