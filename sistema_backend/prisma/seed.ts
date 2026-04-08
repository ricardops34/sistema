import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Iniciando script de Populamento (Seed) do MVP...');

  // 1. Limpeza completa do banco
  await prisma.companyCollaborator.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.collaborator.deleteMany();
  await prisma.role.deleteMany();
  await prisma.professional.deleteMany();
  await prisma.company.deleteMany();
  await prisma.city.deleteMany();
  await prisma.state.deleteMany();
  await prisma.user.deleteMany();
  console.log('🧹 Banco de dados limpo.');

  // --- USUÁRIO ADMIN ---
  console.log('👤 Criando Usuário Admin...');
  const salt = await bcrypt.genSalt();
  const hashedPassword = await bcrypt.hash('admin123', salt);
  await prisma.user.upsert({
    where: { login: 'admin' },
    update: {},
    create: { login: 'admin', password: hashedPassword, name: 'Administrador FB', profile: 'admin', status: 'A' }
  });

  // --- ESTADOS ---
  console.log('🗺️ Criando Estados...');
  const states = [
    { id: 1, name: 'Mato Grosso do Sul', uf: 'MS' },
    { id: 2, name: 'São Paulo', uf: 'SP' },
    { id: 3, name: 'Rio de Janeiro', uf: 'RJ' },
    { id: 4, name: 'Minas Gerais', uf: 'MG' },
    { id: 5, name: 'Paraná', uf: 'PR' },
    { id: 6, name: 'Rio Grande do Sul', uf: 'RS' },
    { id: 7, name: 'Santa Catarina', uf: 'SC' },
    { id: 8, name: 'Bahia', uf: 'BA' },
    { id: 9, name: 'Goiás', uf: 'GO' },
    { id: 10, name: 'Distrito Federal', uf: 'DF' },
  ];
  await prisma.state.createMany({ data: states, skipDuplicates: true });

  // --- CIDADES ---
  console.log('🏙️ Criando Cidades...');
  const cities = [
    { id: 1, name: 'CAMPO GRANDE', stateId: 1 },
    { id: 2, name: 'DOURADOS', stateId: 1 },
    { id: 3, name: 'SÃO PAULO', stateId: 2 },
    { id: 4, name: 'CAMPINAS', stateId: 2 },
    { id: 5, name: 'RIBEIRÃO PRETO', stateId: 2 },
    { id: 6, name: 'ARARAQUARA', stateId: 2 },
    { id: 7, name: 'MATÃO', stateId: 2 },
    { id: 8, name: 'RIO DE JANEIRO', stateId: 3 },
    { id: 9, name: 'BELO HORIZONTE', stateId: 4 },
    { id: 10, name: 'CURITIBA', stateId: 5 },
  ];
  await prisma.city.createMany({ data: cities, skipDuplicates: true });

  // --- FUNÇÕES ---
  console.log('👔 Criando Funções...');
  const roles = [
    { id: 1, name: 'Administrativo' },
    { id: 2, name: 'Proprietário' },
    { id: 3, name: 'Técnico' },
    { id: 4, name: 'Desenvolvedor' },
    { id: 5, name: 'Consultor' },
  ];
  await prisma.role.createMany({ data: roles, skipDuplicates: true });

  // --- EMPRESAS ---
  console.log('🏢 Criando Empresas...');
  await prisma.company.createMany({
    data: [
      { id: 1, name: 'MATPAR', legalName: 'MATPAR', responsible: 'Adriano', color: '#9E9E9E', stateId: 1, cityId: 1, address: 'Av. Principal, 100', status: 'A' },
      { id: 2, name: 'BJ Soft', legalName: 'BJ Soft Ltda', responsible: 'Ricardo', color: '#2196F3', stateId: 2, cityId: 7, address: 'Rua Tech, 200', status: 'A' },
      { id: 3, name: 'Health Brasil', legalName: 'Health Brasil', responsible: 'Carlos', color: '#9E9E9E', stateId: 2, cityId: 3, status: 'A' },
      { id: 4, name: 'H2L', legalName: 'H2L', color: '#00BCD4', stateId: 1, cityId: 1, status: 'A' },
      { id: 5, name: 'JFS', legalName: 'JEITO FRIO', color: '#FF5722', stateId: 1, cityId: 1, status: 'A' },
    ],
    skipDuplicates: true
  });

  // --- COLABORADORES ---
  console.log('👷 Criando Colaboradores...');
  await prisma.collaborator.createMany({
    data: [
      { id: 1, name: 'Ricardo Patay Sotomayor', email: 'ricardops34@hotmail.com', phone: '679914684', whatsapp: true, roleId: 1, status: 'A' },
      { id: 2, name: 'Adriano', email: 'adriano@matpar.com', phone: '6799001234', whatsapp: false, roleId: 2, status: 'A' },
      { id: 3, name: 'João Técnico', email: 'joao@bjsoft.com', phone: '1199887766', whatsapp: true, roleId: 3, status: 'A' },
    ],
    skipDuplicates: true
  });

  // --- VÍNCULOS EMPRESA <-> COLABORADOR ---
  console.log('🔗 Vinculando Colaboradores às Empresas...');
  await prisma.companyCollaborator.createMany({
    data: [
      { companyId: 1, collaboratorId: 1 },
      { companyId: 1, collaboratorId: 2 },
      { companyId: 2, collaboratorId: 1 },
      { companyId: 2, collaboratorId: 3 },
    ],
    skipDuplicates: true
  });

  // --- PROFISSIONAIS ---
  console.log('👨‍💻 Criando Profissionais...');
  await prisma.professional.createMany({
    data: [
      { id: 1, name: 'Ricardo Silva', systemUser: 'admin', status: 'A' },
      { id: 2, name: 'João Técnico', systemUser: 'joao.user', status: 'A' }
    ],
    skipDuplicates: true
  });

  // --- AGENDAMENTO ---
  console.log('📅 Criando Agendamento Inicial...');
  const today = new Date();
  const start = new Date(today.setHours(9, 0, 0, 0));
  const end = new Date(today.setHours(12, 0, 0, 0));
  await prisma.appointment.create({
    data: {
      description: 'Reunião de Alinhamento MVP',
      initialTime: start, finalTime: end, totalHours: '03:00',
      type: 'A', status: 'C', date: start,
      companyId: 1, professionalId: 1, color: '#3f51b5'
    }
  });

  console.log('✅ Seed finalizado com sucesso! Usuário: admin / Senha: admin123');
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
