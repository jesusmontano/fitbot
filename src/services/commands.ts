import { App, Middleware, SlackEventMiddlewareArgs } from '@slack/bolt';
import { CompleteChallengeResult, ScheduleType } from '../types';
import { scheduleChallenge } from './challenge';
import { completeChallenge } from './database';
import { isGenericMessageEvent } from '../util/helpers';
import { getLoggerByFilename } from '../util/logger';
import { Logger } from 'log4js';
import { getClient } from './slack';

const log: Logger = getLoggerByFilename(__filename);

type TriggerCallback = Middleware<SlackEventMiddlewareArgs<'message'>>;

const registerTrigger = (app: App, trigger: string, callback: TriggerCallback) => {
	log.info(`Registering trigger ${trigger}`);
	app.message(trigger, callback);
};

const registerTriggers = (app: App) => {
	// Listens to incoming messages that contain "!lets-go"
	registerTrigger(app, '!lets-go', async ({ message, say }: SlackEventMiddlewareArgs<'message'>) => {
		if (!isGenericMessageEvent(message)) return;

		log.info(`Received !lets-go from ${message.user}`);
		const client = getClient();
		const { members } = await client.conversations.members({ channel: message.channel });
		if (!members) return;
		await scheduleChallenge(ScheduleType.Immediate);
	});

	// Listens to incoming messages that contain "!top-scores"
	registerTrigger(app, '!top-scores', async ({ message, say }: SlackEventMiddlewareArgs<'message'>) => {
		if (!isGenericMessageEvent(message)) return;

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
	registerTrigger(app, '!my-score', async ({ message, say }: SlackEventMiddlewareArgs<'message'>) => {
		if (!isGenericMessageEvent(message)) return;

		log.info(`Received !my-score from ${message.user}`);

		await say({
			text: `:100: Here's your score, <@${message.user}>! \n` + `Push-ups: 100 \n` + `Ski-sits: 60 \n`,
			blocks: [
				{
					type: 'section',
					text: {
						type: 'mrkdwn',
						text:
							`*Here's your score, <@${message.user}>!* :100: \n` +
							`Push-ups: 100 \n` +
							`Ski-sits: 60 \n`,
					},
				},
			],
		});
	});

	registerTrigger(app, '!did-it', async ({ message, say }: SlackEventMiddlewareArgs<'message'>) => {
		if (!isGenericMessageEvent(message)) return;

		log.info(`Received !did-it from ${message.user}`);

		const result = completeChallenge(message.user);

		if (result === CompleteChallengeResult.NotFound) {
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

	registerTrigger(app, '!help', async ({ message, say }: SlackEventMiddlewareArgs<'message'>) => {
		if (!isGenericMessageEvent(message)) return;

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

export { registerTriggers };
