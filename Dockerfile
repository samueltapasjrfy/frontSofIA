# ============================================
# Stage 1: Dependencies
# ============================================
FROM node:20-alpine AS deps

# Instalar git para dependências que possam precisar
RUN apk add --no-cache libc6-compat git

WORKDIR /app

# Copiar arquivos de dependências
COPY package.json package-lock.json* ./

# Instalar todas as dependências (incluindo devDependencies para build)
RUN npm install --force

# ============================================
# Stage 2: Builder
# ============================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar dependências do stage anterior
COPY --from=deps /app/node_modules ./node_modules

# Copiar código fonte
COPY . .

# Variáveis de ambiente para build (opcional, pode ser sobrescrito)
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_API_URL_V2
ARG NEXT_PUBLIC_NEXA_API_URL
ARG NEXT_PUBLIC_FILES
ARG NEXT_PUBLIC_GOOGLE_CLIENT_ID
ARG NODE_ENV=production

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL_V2=$NEXT_PUBLIC_API_URL_V2
ENV NEXT_PUBLIC_NEXA_API_URL=$NEXT_PUBLIC_NEXA_API_URL
ENV NEXT_PUBLIC_FILES=$NEXT_PUBLIC_FILES
ENV NEXT_PUBLIC_GOOGLE_CLIENT_ID=$NEXT_PUBLIC_GOOGLE_CLIENT_ID
ENV NODE_ENV=$NODE_ENV

# Criar usuário não-root para build
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001 -G nodejs

# Mudar propriedade dos arquivos
RUN chown -R nextjs:nodejs /app

# Mudar para usuário não-root
USER nextjs

# Build da aplicação Next.js (standalone mode)
RUN npm run build

# ============================================
# Stage 3: Production Runtime
# ============================================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Criar usuário não-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001 -G nodejs

# Copiar arquivos standalone do build
# O modo standalone cria uma pasta .next/standalone com tudo necessário
# Nota: O Next.js standalone já inclui node_modules e server.js na raiz do standalone
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Mudar para usuário não-root
USER nextjs

# Expor porta
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/api/health/live', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Comando de inicialização
CMD ["node", "server.js"]

