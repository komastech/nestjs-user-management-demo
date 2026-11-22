# Stage 1 : build TypeScript
# --platform=$BUILDPLATFORM : ce stage tourne toujours sur l'architecture native
# du runner (pas d'émulation QEMU). Le dist/ produit est du JavaScript, valable
# pour toutes les architectures.
FROM --platform=$BUILDPLATFORM node:24-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2 : prod (construit pour chaque plateforme cible)
FROM node:24-alpine AS runner
ENV NODE_ENV=production
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
RUN chown -R node /app
USER node
EXPOSE 3000
CMD ["node", "dist/main"]
