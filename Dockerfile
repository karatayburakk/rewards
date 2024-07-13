# Stage 1: Build the application
FROM node:20 AS builder

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install

COPY . .

RUN yarn prisma generate
RUN yarn build

# Stage 2: Create the production image
FROM node:20-slim

WORKDIR /app

# Install OpenSSL
RUN apt-get update && apt-get install -y openssl procps

COPY --from=builder /app /app

# Copy and set permissions for the entrypoint script
COPY entrypoint.sh /app/
RUN chmod +x /app/entrypoint.sh

ARG DEFAULT_PORT=3000
ENV PORT=${DEFAULT_PORT}

EXPOSE ${PORT}

ENTRYPOINT ["/app/entrypoint.sh"]