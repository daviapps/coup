// import { createLogger, format, transports, Logger } from "winston";
// import path from "path";

// // Helper para extrair o arquivo e a linha da stack trace
// const getCallerFile = () => {
//   const error = new Error();
//   const stack = error.stack?.split("\n");

//   if (!stack) return "unknown";

//   // O índice 4 ou 5 geralmente aponta para quem chamou o logger
//   // após passar pelas camadas internas do Winston
//   const callerLine = stack[4];
//   if (!callerLine) return "unknown";

//   const match =
//     callerLine.match(/\((.*):(\d+):(\d+)\)$/) ||
//     callerLine.match(/at (.*):(\d+):(\d+)$/);

//   if (match) {
//     const filePath = match[1];
//     const line = match[2];
//     return `${path.basename(filePath)}:${line}`;
//   }

//   return "unknown";
// };

// const customFormat = format.printf(({ timestamp, level, message, label }) => {
//   return `${timestamp} [${label}] ${level}: ${message}`;
// });

// export const logger: Logger = createLogger({
//   format: format.combine(
//     format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
//     // Middleware customizado para injetar o arquivo
//     format((info) => {
//       info.label = getCallerFile();
//       return info;
//     })(),
//     format.colorize(),
//     customFormat,
//   ),
//   transports: [new transports.Console()],
// });

import winston from "winston";

export const logger = winston.createLogger({
  level: "info", // Minimum log level
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), // Adiciona data/hora
    winston.format.printf(
      (info) => `${info.timestamp} ${info.level}: ${info.message}`,
    ), // Define a ordem
  ),
  transports: [
    new winston.transports.Console(), // Log to the console
    new winston.transports.File({ filename: "server.log" }), // Example of logging to a file
  ],
});
