"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateEnvs = exports.getRandomUser = exports.isGenericMessageEvent = void 0;
const logger_1 = require("./logger");
const log = logger_1.getLoggerByFilename(__filename);
const isGenericMessageEvent = (msg) => {
    return msg.subtype === undefined;
};
exports.isGenericMessageEvent = isGenericMessageEvent;
const getRandomUser = (users) => {
    return users[Math.floor(Math.random() * users.length)];
};
exports.getRandomUser = getRandomUser;
const validateEnvs = (envNames) => {
    envNames.forEach((envName) => {
        if (process.env[envName] === '') {
            log.info(`Missing environment variable: ${envName}`);
            process.exit(1);
        }
    });
};
exports.validateEnvs = validateEnvs;
//# sourceMappingURL=helpers.js.map