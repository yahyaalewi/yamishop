const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const morgan = require('morgan');

const app = express();

// ── Trust the WAF / Nginx reverse-proxy ───────────────────────────────────────
// This ensures req.ip reflects the real client IP, not the proxy IP.
app.set('trust proxy', 1);

// ── Security Headers (Helmet) ─────────────────────────────────────────────────
app.use(
  helmet({
    // Content-Security-Policy
    contentSecurityPolicy: {
      directives: {
        defaultSrc:     ["'self'"],
        scriptSrc:      ["'self'"],
        styleSrc:       ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc:        ["'self'", 'https://fonts.gstatic.com'],
        imgSrc:         ["'self'", 'data:', 'blob:'],
        connectSrc:     ["'self'"],
        frameSrc:       ["'none'"],
        objectSrc:      ["'none'"],
        baseUri:        ["'self'"],
        formAction:     ["'self'"],
        upgradeInsecureRequests: [],
      },
    },
    // HTTP Strict Transport Security – 1 year, includes sub-domains
    strictTransportSecurity: {
      maxAge: 31_536_000,
      includeSubDomains: true,
      preload: true,
    },
    // Prevent click-jacking
    frameguard: { action: 'deny' },
    // Stop browsers from MIME-sniffing
    noSniff: true,
    // Don't leak the referrer to third-party sites
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    // Allow cross-origin resource loading (images served from /uploads)
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginOpenerPolicy: { policy: 'same-origin' },
    // Hide X-Powered-By
    hidePoweredBy: true,
  })
);

// ── CORS ──────────────────────────────────────────────────────────────────────
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost').split(',');
app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (mobile apps, curl, Postman) or if * is allowed
    if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      return cb(null, true);
    }
    cb(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Static files
const uploadsPath = path.join(__dirname, '../uploads');
console.log('Uploads path:', uploadsPath);
app.use('/uploads', express.static(uploadsPath));

// Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});
app.use('/api/', apiLimiter);

// Swagger
const { swaggerUi, specs } = require('./config/swagger');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Route Imports
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

// Routes
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/uploads', uploadRoutes);

// Health check endpoint (used by Docker Compose)
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.get('/', (req, res) => {
  res.send('Yamishop API is running');
});

// Error Handling
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(err.status || 500).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

module.exports = app;
