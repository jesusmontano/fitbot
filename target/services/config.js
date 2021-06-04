"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConfig = void 0;
const promises_1 = require("fs/promises");
const CONFIG_FILE_PATH = './data/config.json';
const getConfig = async () => {
    const configString = await promises_1.readFile(CONFIG_FILE_PATH, 'utf8');
    return JSON.parse(configString);
};
exports.getConfig = getConfig;
//# sourceMappingURL=config.js.map