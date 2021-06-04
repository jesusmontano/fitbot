"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerTriggers = void 0;
const types_1 = require("../types");
const challenge_1 = require("./challenge");
const database_1 = require("./database");
const helpers_1 = require("../util/helpers");
const logger_1 = require("../util/logger");
const slack_1 = require("./slack");
const log = logger_1.getLoggerByFilename(__filename);
const registerTrigger = (app, trigger, callback) => {
    log.info(`Registering trigger ${trigger}`);
    app.message(trigger, callback);
};
const registerTriggers = (app) => {
    // Listens to incoming messages that contain "!lets-go"
    registerTrigger(app, '!lets-go', async ({ message, say }) => {
        if (!helpers_1.isGenericMessageEvent(message))
            return;
        log.info(`Received !lets-go from ${message.user}`);
        const client = slack_1.getClient();
        const { members } = await client.conversations.members({ channel: message.channel });
        if (!members)
            return;
        await challenge_1.scheduleChallenge(types_1.ScheduleType.Immediate);
    });
    // Listens to incoming messages that contain "!top-scores"
    registerTrigger(app, '!top-scores', async ({ message, say }) => {
        if (!helpers_1.isGenericMessageEvent(message))
            return;
        log.info(`Received !top-scores from ${message.user}`);
        await say({
            text: `:mega:* Here are the top performers on FitBot!`,
            blocks: [
                {
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: '*Here are the top scores!* :mega: ',
                    },
                },
                {
                    type: 'divider',
                },
                {
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: ':first_place_medal: Jim',
                    },
                },
                {
                    type: 'divider',
                },
                {
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: ':second_place_medal: Luis',
                    },
                },
                {
                    type: 'divider',
                },
                {
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: ':third_place_medal: Jesus',
                    },
                },
            ],
        });
    });
    // Listens to incoming messages that contain "!my-score"
    registerTrigger(app, '!my-score', async ({ message, say }) => {
        if (!helpers_1.isGenericMessageEvent(message))
            return;
        log.info(`Received !my-score from ${message.user}`);
        let totalAchievements = database_1.getUserScore(message.user);
        console.log(totalAchievements);
        await say({
            text: `:100: Here's your score, <@${message.user}>! \n` + `You've completed ${totalAchievements}. \n`,
            blocks: [
                {
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: `*Here's your score, <@${message.user}>!* :100: \n` +
                            `You've completed ${totalAchievements.achievement_count} challenges. \n`,
                    },
                },
            ],
        });
    });
    registerTrigger(app, '!did-it', async ({ message, say }) => {
        if (!helpers_1.isGenericMessageEvent(message))
            return;
        log.info(`Received !did-it from ${message.user}`);
        const result = database_1.completeChallenge(message.user);
        if (result === types_1.CompleteChallengeResult.NotFound) {
            await say({
                text: `I haven't submitted any challenges yet, <@${message.user}>. Type '!lets-go' to get started!`,
                blocks: [
                    {
                        type: 'section',
                        text: {
                            type: 'mrkdwn',
                            text: `I haven't submitted any challenges yet, <@${message.user}>. Type '!lets-go' to get started!`,
                        },
                    },
                ],
            });
            return;
        }
        await say({
            text: `:tada: Congratulations on completing your most recent challenge, <@${message.user}>!`,
            blocks: [
                {
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: `:tada: Congratulations on completing your most recent challenge, <@${message.user}>!`,
                    },
                },
            ],
        });
    });
    registerTrigger(app, '!help', async ({ message, say }) => {
        if (!helpers_1.isGenericMessageEvent(message))
            return;
        log.info(`Received !help from ${message.user}`);
        await say({
            blocks: [
                {
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: `*Here's the list of commands used by FitBot.*`,
                    },
                },
                {
                    type: 'divider',
                },
                {
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: `*!top-scores* :point_right: Returns the top performers.`,
                    },
                },
                {
                    type: 'divider',
                },
                {
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: `*!my-score* :point_right: Returns your score.`,
                    },
                },
                {
                    type: 'divider',
                },
                {
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: `*!did-it* :point_right: Confirms that you completed your challenge so that it can be added to your score.`,
                    },
                },
                {
                    type: 'divider',
                },
                {
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: `*!lets-go* :point_right: Triggers FitBot to give you a challenge right away.`,
                    },
                },
            ],
        });
    });
};
exports.registerTriggers = registerTriggers;
//# sourceMappingURL=commands.js.map