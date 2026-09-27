# MetriKas 🎯

> Sistema modular de controle de metas e metrificação de ações pessoais.

## Estrutura do Projeto

```
metrikas/
├── mobile/   # React Native + Expo (Expo Router, NativeWind, Zustand)
├── api/      # Fastify + Prisma + PostgreSQL
└── shared/   # Tipos e schemas TypeScript compartilhados
```

## Pré-requisitos

- Node.js >= 20
- Docker e Docker Compose
- Expo CLI (`npm install -g expo-cli`)
- EAS CLI (`npm install -g eas-cli`)

## Setup Inicial

```bash
# 1. Instale as dependências de todos os pacotes
cd api && npm install
cd ../mobile && npm install
cd ../shared && npm install

# 2. Configure as variáveis de ambiente
cp api/.env.example api/.env

# 3. Suba o banco de dados
docker compose -f api/docker-compose.yml up -d

# 4. Execute as migrations
cd api && npx prisma migrate dev

# 5. Rode a API
cd api && npm run dev

# 6. Rode o app mobile
cd mobile && npx expo start
```

## Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| Mobile | React Native, Expo, Expo Router |
| Estilização | NativeWind (TailwindCSS) |
| Animações | Reanimated 3, Moti, Lottie |
| Gráficos | Victory Native |
| State | Zustand |
| HTTP | Axios (abstraído) |
| Backend | Fastify, TypeScript |
| ORM | Prisma |
| Banco | PostgreSQL |
| Validação | Zod |
| Auth | Google Sign-In + JWT |
| Notificações | Expo Notifications |
| i18n | react-i18next |
| Testes | Vitest (API), Jest + RNTL (mobile) |
