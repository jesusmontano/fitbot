"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.showLogo = void 0;
const logger_1 = require("../util/logger");
const log = logger_1.getLoggerByFilename(__filename);
const showLogo = () => {
    log.info('\n' +
        `     ___  _  _    _             _     _      ___      \n` +
        `    / __\\(_)| |_ | |__    ___  | |_  / |    / _ \\   \n` +
        `   / _\\  | || __|| '_ \\  / _ \\ | __| | |   | | | | \n` +
        `  / /    | || |_ | |_) || (_) || |_  | | _ | |_| |    \n` +
        `  \\/     |_| \\__||_.__/  \\___/  \\__| |_|(_) \\___/\n`, 'by Jesus Montano and Jim Redfern');
};
exports.showLogo = showLogo;
//# sourceMappingURL=logo.js.map