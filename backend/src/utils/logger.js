import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

class Logger {
  constructor() {
    this.levels = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3,
    };

    this.currentLevel = this.levels[process.env.LOG_LEVEL] || this.levels.debug;
  }

  formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const formattedMeta = Object.keys(meta).length ? JSON.stringify(meta) : '';
    return `[${timestamp}] ${level.toUpperCase()}: ${message} ${formattedMeta}`;
  }

  log(level, message, meta = {}) {
    if (this.levels[level] <= this.currentLevel) {
      const formattedMessage = this.formatMessage(level, message, meta);
      
      // Console output
      if (level === 'error') {
        console.error(formattedMessage);
      } else if (level === 'warn') {
        console.warn(formattedMessage);
      } else {
        console.log(formattedMessage);
      }

      // File output
      const logFile = path.join(logsDir, `${level}.log`);
      fs.appendFileSync(logFile, formattedMessage + '\n');

      // Combined log
      const combinedLog = path.join(logsDir, 'combined.log');
      fs.appendFileSync(combinedLog, formattedMessage + '\n');
    }
  }

  error(message, meta) {
    this.log('error', message, meta);
  }

  warn(message, meta) {
    this.log('warn', message, meta);
  }

  info(message, meta) {
    this.log('info', message, meta);
  }

  debug(message, meta) {
    this.log('debug', message, meta);
  }

  // Log HTTP request
  logRequest(req, res, responseTime) {
    const message = `${req.method} ${req.originalUrl} ${res.statusCode} ${responseTime}ms`;
    const meta = {
      ip: req.ip,
      userAgent: req.get('user-agent'),
      userId: req.user?.id,
    };
    this.info(message, meta);
  }

  // Log error with stack trace
  logError(error, req = null) {
    const meta = {
      stack: error.stack,
      ...(req && {
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        userId: req.user?.id,
      }),
    };
    this.error(error.message, meta);
  }
}

const logger = new Logger();

export default logger;