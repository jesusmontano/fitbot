'use strict';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.trimString = exports.getLoggerByFilename = exports.getLoggerByUrl = void 0;
const log4js_1 = __importDefault(require("log4js"));
const url_1 = require("url");
const TRIM_LENGTH = 1024;
const LOG_PATTERN = '%d %p %f{1} %[%m%]';
log4js_1.default.configure({
    appenders: { out: { type: 'stdout', layout: { type: 'pattern', pattern: LOG_PATTERN } } },
    categories: { default: { enableCallStack: true, appenders: ['out'], level: 'debug' } },
});
const getFilename = (url) => {
    const pathname = new url_1.URL(url).pathname;
    return pathname.substring(pathname.lastIndexOf('/') + 1);
};
const getLoggerByUrl = (url) => {
    const filename = getFilename(url);
    return log4js_1.default.getLogger(filename);
};
exports.getLoggerByUrl = getLoggerByUrl;
const getLoggerByFilename = (filename) => {
    return log4js_1.default.getLogger(filename);
};
exports.getLoggerByFilename = getLoggerByFilename;
const trimString = (input, length) => {
    const trimLength = length || TRIM_LENGTH;
    if (input.length < trimLength) {
        return input;
    }
    return input.slice(0, trimLength) + '\n  ...';
};
exports.trimString = trimString;
//# sourceMappingURL=logger.js.map