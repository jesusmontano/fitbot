"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bolt_1 = require("@slack/bolt");
const logo_1 = require("./services/logo");
const challenge_1 = require("./services/challenge");
const helpers_1 = require("./util/helpers");
const types_1 = require("./types");
const commands_1 = require("./services/commands");
const logger_1 = require("./util/logger");
const log = logger_1.getLoggerByFilename(__filename);
logo_1.showLogo();
helpers_1.validateEnvs(['SLACK_SIGNING_SECRET', 'SLACK_BOT_TOKEN', 'SLACK_CHANNEL_ID', 'SLACK_BOT_ID']);
const app = new bolt_1.App({
    token: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET,
});
commands_1.registerTriggers(app);
(async () => {
    const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
    await app.start(port);
    log.info(`Started app on port ${port}`);
    await challenge_1.scheduleChallenge(types_1.ScheduleType.Random);
})();
exports.default = {};
//# sourceMappingURL=index.js.map