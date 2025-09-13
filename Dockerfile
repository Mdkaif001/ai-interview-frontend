# BUILDER STAGE
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install --frozen-lockfile

COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# PRODUCTION STAGE
FROM node:20-alpine AS production

WORKDIR /app

COPY --from=builder /app /app

EXPOSE 8080

CMD ["npm", "start"]
