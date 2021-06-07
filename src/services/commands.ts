import { App, Middleware, SlackCommandMiddlewareArgs } from '@slack/bolt';
import { CompleteChallengeResult, ScheduleType } from '../types';
import { scheduleChallenge } from './challenge';
import { completeChallenge, getTopScores, getUserScore } from './database';
import { getLoggerByFilename } from '../util/logger';
import { Logger } from 'log4js';
import { getClient } from './slack';

const log: Logger = getLoggerByFilename(__filename);

const registerCommand = (app: App, trigger: string | RegExp, callback: Middleware<SlackCommandMiddlewareArgs>) => {
	log.info(`Registering command trigger ${trigger}`);
	app.command(trigger, callback);
};

const getPlaceText = (place: number): string => {
	switch (place) {
		case 0: {
			return '#1 :first_place_medal:';
		}
		case 1: {
			return '#2 :second_place_medal:';
		}
		case 2: {
			return '#3 :third_place_medal:';
		}
		default: {
			return `#${place + 1}`;
		}
	}
};

const registerCommands = (app: App) => {
	registerCommand(app, '/lets-go', async ({ command, ack, say }: SlackCommandMiddlewareArgs) => {
		log.info(`Received ${command.command} from ${command.user_id}`);
		await ack();
		const client = getClient();
		const { members } = await client.conversations.members({ channel: command.channel_id });
		if (!members) return;
		await scheduleChallenge(ScheduleType.Immediate);
	});

	registerCommand(app, '/top-scores', async ({ command, ack, say }: SlackCommandMiddlewareArgs) => {
		log.info(`Received ${command.command} from ${command.user_id}`);
		await ack();
		const topScores = getTopScores(10);
		const title = {
			type: 'section',
			text: {
				type: 'mrkdwn',
				text: '*Here are the top scores!* :mega: ',
			},
		};
		const blocks = topScores.reduce(
			(output, score, place) => {
				const placeText = getPlaceText(place);
				output.push({
					type: 'section',
					text: {
						type: 'mrkdwn',
						text: `${placeText} <@${score.user_id}> completed ${score.achievement_count} challenges`,
					},
				});
				return output;
			},
			[title],
		);

		await say({
			text: `:mega:* Here are the top performers on FitBot!`,
			blocks: [
				...blocks,
				{
					type: 'divider',
				},
			],
		});
	});

	registerCommand(app, '/my-score', async ({ command, ack, say }: SlackCommandMiddlewareArgs) => {
		log.info(`Received ${command.command} from ${command.user_id}`);
		await ack();
		const myScore = getUserScore(command.user_id);

		await say({
			text: `Here's your score, <@${command.user_id}>! You've completed ${myScore.achievement_count} challenges. :100:`,
			blocks: [
				{
					type: 'section',
					text: {
						type: 'mrkdwn',
						text: `*Here's your score, <@${command.user_id}>!* You've completed ${myScore.achievement_count} challenges. :100:`,
					},
				},
				{
					type: 'divider',
				},
			],
		});
	});

	registerCommand(app, '/did-it', async ({ command, ack, say }: SlackCommandMiddlewareArgs) => {
		log.info(`Received ${command.command} from ${command.user_id}`);
		await ack();
		const result = completeChallenge(command.user_id);

		if (result === CompleteChallengeResult.Completed) {
			await say({
				text: `:tada: Congratulations on completing your most recent challenge, <@${command.user_id}>!`,
				blocks: [
					{
						type: 'section',
						text: {
							type: 'mrkdwn',
							text: `:tada: Congratulations on completing your most recent challenge, <@${command.user_id}>!`,
						},
					},
					{
						type: 'divider',
					},
				],
			});
		} else if (result === CompleteChallengeResult.NotFound) {
			await say({
				text: `I haven't sent any challenges yet, <@${command.user_id}>. Type '!lets-go' to get started!`,
				blocks: [
					{
						type: 'section',
						text: {
							type: 'mrkdwn',
							text: `I haven't sent any challenges yet, <@${command.user_id}>. Type '!lets-go' to get started!`,
						},
					},
					{
						type: 'divider',
					},
				],
			});
		}
	});

	registerCommand(app, '/fitbot-help', async ({ command, ack, say }: SlackCommandMiddlewareArgs) => {
		log.info(`Received ${command.command} from ${command.user_id}`);
		await ack();
		await say({
			text:
				`Here's the list of commands used by FitBot:\n` +
				`*/top-scores* :point_right: See the challenges leaderboard.\n` +
				`*/my-score* :point_right: See how many challenges you've completed.\n` +
				`*/did-it* :point_right: Tell FitBot you've completed a challenge.\n` +
				`*/lets-go* :point_right: Trigger a FitBot challenge.\n` +
				`*/help* :point_right: Show this help message.\n`,
			blocks: [
				{
					type: 'section',
					text: {
						type: 'mrkdwn',
						text: `*Here's the list of commands used by FitBot:*`,
					},
				},
				{
					type: 'section',
					text: {
						type: 'mrkdwn',
						text: `*/top-scores* :point_right: See the challenges leaderboard.`,
					},
				},
				{
					type: 'section',
					text: {
						type: 'mrkdwn',
						text: `*/my-score* :point_right: See how many challenges you've completed.`,
					},
				},
				{
					type: 'section',
					text: {
						type: 'mrkdwn',
						text: `*/did-it* :point_right: Tell FitBot you've completed a challenge.`,
					},
				},
				{
					type: 'section',
					text: {
						type: 'mrkdwn',
						text: `*/lets-go* :point_right: Trigger a FitBot challenge.`,
					},
				},
				{
					type: 'section',
					text: {
						type: 'mrkdwn',
						text: `*/help* :point_right: Show this help message.`,
					},
				},
				{
					type: 'divider',
				},
			],
		});
	});
};

export { registerCommands };
