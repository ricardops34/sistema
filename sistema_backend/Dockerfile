# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copia arquivos de denpendência
COPY package*.json ./
COPY prisma ./prisma/

# Instala dependências (incluindo dev para o build)
RUN npm install

# Copia o código fonte
COPY . .

# Gera o Prisma Client e faz o build do NestJS
RUN npx prisma generate
RUN npm run build

# Stage 2: Production
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copia apenas o necessário do stage anterior
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Porta padrão do NestJS
EXPOSE 3000

# Comando para rodar a aplicação
CMD ["node", "dist/main.js"]
