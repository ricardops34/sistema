# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

# Instala o Angular CLI globalmente
RUN npm install -g @angular/cli@19

COPY package*.json ./
RUN npm install

COPY . .

# Faz o build do Angular para produção
RUN npm run build -- --configuration=production

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copia o build do Angular para o diretório do Nginx
# Ajuste o caminho 'dist/sistema-novo/browser' se necessário
COPY --from=builder /app/dist/sistema-novo/browser /usr/share/nginx/html

# Copia configuração customizada do Nginx para SPA (Single Page Application)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
