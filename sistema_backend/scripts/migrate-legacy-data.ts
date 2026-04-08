import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as readline from 'readline';
import * as path from 'path';

const prisma = new PrismaClient();
const SQL_FILE_PATH = path.join(__dirname, '../../sistema_antigo/backup/bjsoft18_portal.sql');

async function migrate() {
  console.log('🚀 Iniciando Migração de Dados Legados...');

  if (!fs.existsSync(SQL_FILE_PATH)) {
    console.error(`❌ Arquivo SQL não encontrado em: ${SQL_FILE_PATH}`);
    return;
  }

  const fileStream = fs.createReadStream(SQL_FILE_PATH);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  let currentTable = '';
  let inInsert = false;
  let insertCount = 0;

  for await (const line of rl) {
    const trimmedLine = line.trim();
    
    if (trimmedLine.startsWith('INSERT INTO')) {
      const match = trimmedLine.match(/INSERT INTO `(\w+)`/);
      if (match) {
        currentTable = match[1];
        inInsert = true;
        continue;
      }
    }

    if (inInsert && trimmedLine.startsWith('(')) {
      // Remover parenteses extras e o separador final (virgula ou ponto e virgula)
      const row = trimmedLine.replace(/^\(|\)[,;]?$/g, '');
      const cols = row.split(',').map(c => {
        let val = c.trim().replace(/^'|'$/g, '').replace(/''/g, "'");
        return val === 'NULL' ? null : val;
      });
      
      try {
        if (currentTable === 'empresa' && cols.length >= 2) {
          await prisma.company.upsert({
            where: { id: parseInt(cols[0]) },
            update: {
              name: cols[1] || 'S/N',
              legalName: cols[5] || cols[1] || 'S/N',
              responsible: cols[6] || '',
              address: cols[3] || '',
              cityId: cols[2] ? parseInt(cols[2]) : null,
              status: 'A'
            },
            create: {
              id: parseInt(cols[0]),
              name: cols[1] || 'S/N',
              legalName: cols[5] || cols[1] || 'S/N',
              responsible: cols[6] || '',
              address: cols[3] || '',
              cityId: cols[2] ? parseInt(cols[2]) : null,
              status: 'A'
            }
          });
          insertCount++;
        } else if (currentTable === 'profissional' && cols.length >= 2) {
          await prisma.professional.upsert({
            where: { id: parseInt(cols[0]) },
            update: {
              name: cols[1],
              systemUser: cols[2] || 'Legacy User',
              status: 'A'
            },
            create: {
              id: parseInt(cols[0]),
              name: cols[1],
              systemUser: cols[2] || 'Legacy User',
              status: 'A'
            }
          });
          insertCount++;
        }
      } catch (err) {
        // Silencio para evitar poluição se o casting de ID falhar em alguma linha
      }

      if (trimmedLine.endsWith(';')) {
        inInsert = false;
        currentTable = '';
      }
    } else if (trimmedLine.endsWith(';')) {
      inInsert = false;
    }
  }

  console.log(`✅ Migração concluída! ${insertCount} registros processados.`);
}

migrate()
  .catch((e) => {
    console.error('❌ Erro durante a migração:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
