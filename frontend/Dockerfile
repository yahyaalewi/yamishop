# ── Stage 1: build ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Build the Angular app for production (outputs to dist/frontend/browser)
RUN npx ng build --configuration=production

# ── Stage 2: serve with Nginx ──────────────────────────────────────────────────
FROM nginx:1.27-alpine AS runner

# Create a non-root setup
RUN touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid && \
    chown -R nginx:nginx /var/cache/nginx /var/log/nginx /etc/nginx/conf.d

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy our custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built Angular assets
COPY --from=builder --chown=nginx:nginx /app/dist/frontend/browser /usr/share/nginx/html

USER nginx

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
