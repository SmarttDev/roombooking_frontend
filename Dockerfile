# Install dependencies only when needed
FROM node:14-alpine AS deps
RUN apk add --no-cache git
# Create and change to the app directory.
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Rebuild the source code only when needed
FROM node:14-alpine AS builder
ARG BRANCH_NAME=unknown
RUN apk add --no-cache git
# Create and change to the app directory.
WORKDIR /app
COPY .env.$BRANCH_NAME .env.local
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN yarn build && rm -rf .next/cache && yarn install --production --ignore-scripts --prefer-offline

# Production image, copy all the files and run next
FROM node:14-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# You only need to copy next.config.js if you are NOT using the default configuration
COPY --from=builder /app/.env.local ./
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

USER nextjs

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry.
# ENV NEXT_TELEMETRY_DISABLED 1

CMD ["yarn", "start"]