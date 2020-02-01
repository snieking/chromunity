import { createLogger, format, transports } from "winston";

const { combine, timestamp, colorize, printf, splat, label } = format;
const logger = createLogger({
  exitOnError: false,
  format: combine(
    timestamp(),
    colorize(),
    splat(),
    label({ label: "chromunity" }),
    printf(log => `${log.timestamp} [${log.label} - ${log.level}]: ${log.message}`)
  ),
  transports: [
    new transports.Console({
      level: process.env.NODE_ENV === "production" ? "debug" : "debug"
    })
  ]
});

export default logger;
