FROM node:20-alpine

WORKDIR /app

# Instala OpenSSL para o Prisma
RUN apk add --no-cache openssl

# Copia os manifests
COPY package*.json ./
COPY prisma ./prisma/

# Instala dependências de produção
RUN npm ci --only=production

# Gera o cliente Prisma
RUN npx prisma generate

# Copia o código compilado
COPY dist ./dist

EXPOSE 3333

# Roda migrations e inicia o servidor
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
