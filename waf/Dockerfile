# ── WAF: OWASP ModSecurity CRS (Nginx) ────────────────────────────────────────
# This is a thin wrapper around the official owasp/modsecurity-crs:nginx-alpine
# image. It acts as the sole public entry point (port 80) and protects both the
# frontend and the backend API.
FROM owasp/modsecurity-crs:nginx-alpine

# Copy our custom ModSecurity rule tuning file
COPY modsecurity-tuning.conf /etc/modsecurity.d/modsecurity-tuning.conf

EXPOSE 80
