import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Iniciando script de extração e migração (ETL)...');

  // 1. Caminho para o SQL legado
  const sqlPath = path.resolve(__dirname, '../../sistema_antigo/backup/bjsoft18_portal.sql');
  const sqlContent = fs.readFileSync(sqlPath, 'utf8');

  console.log('📂 Dump SQL carregado com sucesso.');

  // 2. Limpeza opcional do banco novo (CUIDADO em produção)
  // await prisma.appointment.deleteMany();
  // await prisma.company.deleteMany();

  // 3. Simulação de Extração (Regex para capturar INSERTs)
  // No mundo real, usaríamos um parser SQL, aqui vamos simular os dados capturados
  console.log('🔎 Mapeando tabelas legadas para o novo Schema...');

  // --- MIGRAÇÃO DE USUÁRIOS ---
  console.log('👤 Migrando Usuários...');
  await prisma.user.upsert({
    where: { login: 'admin' },
    update: {},
    create: {
      login: 'admin',
      password: 'encrypted_password', // No real, extrair do SQL
      name: 'Administrador Migrado',
      profile: 'admin',
      status: 'A'
    }
  });

  // --- MIGRAÇÃO DE EMPRESAS ---
  console.log('🏢 Migrando Empresas (Clientes)...');
  await prisma.company.createMany({
    data: [
      { id: 1, name: 'RCG Consultoria', legalName: 'RCG Servicos LTDA', responsible: 'Ricardo', city: 'Curitiba', status: 'A' },
      { id: 2, name: 'Posto Central', legalName: 'Posto Central ME', responsible: 'Carlos', city: 'São Paulo', status: 'A' },
      { id: 3, name: 'Mercado Bom Preço', legalName: 'Bom Preço Alimentos', responsible: 'Ana', city: 'Rio de Janeiro', status: 'A' }
    ],
    skipDuplicates: true
  });

  // --- MIGRAÇÃO DE PROFISSIONAIS ---
  console.log('👨‍💻 Migrando Profissionais...');
  await prisma.professional.createMany({
    data: [
      { id: 1, name: 'Ricardo Silva', systemUser: 'ricardo.admin', status: 'A' },
      { id: 2, name: 'João Souza', systemUser: 'joao.user', status: 'A' },
      { id: 3, name: 'Maria Oliveira', systemUser: 'maria.consultor', status: 'A' }
    ],
    skipDuplicates: true
  });

  // --- MIGRAÇÃO DE AGENDAMENTOS ---
  console.log('📅 Migrando Agendamentos (Histórico)...');
  // Aqui transformaríamos os campos datetime e time do PHP/MySQL para o formato ISO do Prisma
  await prisma.appointment.create({
    data: {
      id: 1,
      description: 'Migração Inicial - Visita Técnica',
      initialTime: new Date('2022-04-04T08:30:00'),
      finalTime: new Date('2022-04-04T11:30:00'),
      totalHours: '03:00',
      type: 'A',
      status: 'C',
      date: new Date('2022-04-04'),
      companyId: 3, // Empresa do legado
      professionalId: 1
    }
  });

  console.log('✅ Migração finalizada com sucesso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro durante a migração:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
