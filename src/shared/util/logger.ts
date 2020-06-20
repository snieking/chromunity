import { createLogger, format, transports } from 'winston';
import * as config from '../../config';

const { combine, timestamp, colorize, printf, splat } = format;
const logger = createLogger({
  exitOnError: false,
  format: combine(
    timestamp(),
    colorize(),
    splat(),
    printf((log) => `${log.timestamp} [${log.level}]: ${log.message}`)
  ),
  transports: [
    new transports.Console({
      level: process.env.NODE_ENV === 'production' ? config.logLevel : 'silly',
    }),
  ],
});

export default logger;
