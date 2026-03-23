# ── Stage 1: build API ────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY . .

# ── Stage 2: Final Image with WAF + API ───────────────────────────────────────
# On utilise l'image officielle OWASP ModSecurity qui contient déjà Nginx+WAF
FROM owasp/modsecurity-crs:nginx-alpine

# Utiliser root pour installer les dépendances système
USER root

# Installer Node.js et Supervisor (pour lancer 2 processus en même temps)
RUN apk add --no-cache nodejs npm supervisor

WORKDIR /app

# Copier le code du backend depuis le stage builder
COPY --from=builder /app /app

# Configurer Nginx (WAF)
COPY nginx-waf.conf /etc/nginx/conf.d/default.conf
COPY modsecurity-tuning.conf /etc/modsecurity.d/modsecurity-tuning.conf

# Configuration de Supervisor pour lancer Nginx et Node.js
RUN echo "[supervisord]" > /etc/supervisord.conf && \
    echo "nodaemon=true" >> /etc/supervisord.conf && \
    echo "[program:node-api]" >> /etc/supervisord.conf && \
    echo "command=node src/server.js" >> /etc/supervisord.conf && \
    echo "directory=/app" >> /etc/supervisord.conf && \
    echo "stdout_logfile=/dev/stdout" >> /etc/supervisord.conf && \
    echo "stdout_logfile_maxbytes=0" >> /etc/supervisord.conf && \
    echo "stderr_logfile=/dev/stderr" >> /etc/supervisord.conf && \
    echo "stderr_logfile_maxbytes=0" >> /etc/supervisord.conf && \
    echo "[program:nginx-waf]" >> /etc/supervisord.conf && \
    echo "command=nginx -g 'daemon off;'" >> /etc/supervisord.conf && \
    echo "stdout_logfile=/dev/stdout" >> /etc/supervisord.conf && \
    echo "stdout_logfile_maxbytes=0" >> /etc/supervisord.conf && \
    echo "stderr_logfile=/dev/stderr" >> /etc/supervisord.conf && \
    echo "stderr_logfile_maxbytes=0" >> /etc/supervisord.conf

EXPOSE 80

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"]
