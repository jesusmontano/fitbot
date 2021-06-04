"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getClient = exports.sendChallengeMessage = exports.getUsers = void 0;
const web_api_1 = require("@slack/web-api");
const logger_1 = require("../util/logger");
const log = logger_1.getLoggerByFilename(__filename);
const client = new web_api_1.WebClient(process.env.SLACK_BOT_TOKEN, {
    logLevel: web_api_1.LogLevel.INFO,
});
const getFitbotUserId = async () => {
    const botInfo = await client.bots.info({ bot: process.env.SLACK_BOT_ID });
    if (!botInfo.ok) {
        log.info(`Can't get Slack bot info.`);
        process.exit(1);
    }
    return botInfo.bot?.user_id;
};
const getUsers = async () => {
    const channel = process.env.SLACK_CHANNEL_ID;
    const fitbotUserId = await getFitbotUserId();
    const { members } = await client.conversations.members({ channel });
    if (!members) {
        log.info(`Can't get Slack conversation members.`);
        process.exit(1);
    }
    return members?.filter((member) => {
        return member !== fitbotUserId;
    });
};
exports.getUsers = getUsers;
const getUsersList = (users) => {
    return users.map((user) => `<@${user}>`).join(' ');
};
const sendChallengeMessage = async (challenge) => {
    const channel = process.env.SLACK_CHANNEL_ID;
    const usersList = getUsersList(challenge.users);
    await client.chat.postMessage({
        channel,
        text: `:mega:* ${usersList}! You've been selected to complete the following challenge! ${challenge.message}`,
        blocks: [
            {
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: "Hey there! :wave: I'm FitBot. I'm here to help you get in shape!",
                },
            },
            {
                type: 'divider',
            },
            {
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: `*Roll Call! :mega:* ${usersList}! You've been selected to complete the following challenge.`,
                },
            },
            {
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: `*Challenge! :stopwatch:* ${challenge.message}`,
                },
            },
            {
                type: 'divider',
            },
        ],
    });
};
exports.sendChallengeMessage = sendChallengeMessage;
const getClient = () => client;
exports.getClient = getClient;
//# sourceMappingURL=slack.js.map