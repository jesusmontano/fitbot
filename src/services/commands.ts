import { App, Middleware, SlackCommandMiddlewareArgs } from '@slack/bolt';
import { CompleteChallengeResult, ExerciseCount, MessageType, ScheduleType, Score } from '../types';
import { scheduleChallenge } from './challenge';
import { completeChallenge, getTopScores, getUserScore } from './database';
import { getLoggerByFilename } from '../util/logger';
import { Logger } from 'log4js';
import { getClient } from './slack';
import { getRandomMessage } from '../util/helpers';
import { render } from 'eta';
import { getConfig } from './config';
import { setTimeout } from 'timers/promises';

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

const getScoreText = (score: Score): string => {
	return score.exerciseCounts!.reduce((output, exerciseCount: ExerciseCount) => {
		return output + `${exerciseCount.exerciseName}: *${exerciseCount.count} ${exerciseCount.countUnit}*\n`;
	}, '');
};

const registerCommands = (app: App) => {
	registerCommand(app, '/lets-go', async ({ command, ack, say }: SlackCommandMiddlewareArgs) => {
		log.info(`Received ${command.command} from ${command.user_id}`);
		await ack();
		const client = getClient();
		const config = await getConfig();
		const { members } = await client.conversations.members({ channel: command.channel_id });
		if (!members) return;
		const text = `I hear you <@${command.user_id}>, *lets go!* :muscle:`;
		await say({
			text,
			blocks: [
				{
					type: 'section',
					text: {
						type: 'mrkdwn',
						text,
					},
				},
			],
		});
		await setTimeout(config.messageDelaySeconds * 1000 * 0.66);
		await scheduleChallenge(ScheduleType.Immediate);
	});

	registerCommand(app, '/top-scores', async ({ command, ack, say }: SlackCommandMiddlewareArgs) => {
		log.info(`Received ${command.command} from ${command.user_id}`);
		await ack();
		const topScores = getTopScores(10);
		if (topScores.length === 0) {
			const text = `No challenges have been completed, yet!`;
			await say({
				text,
				blocks: [
					{
						type: 'section',
						text: {
							type: 'mrkdwn',
							text,
						},
					},
				],
			});
			return;
		}
		const topScoresSectionText = topScores.reduce((output, score, place) => {
			const placeText = getPlaceText(place);
			return output + `*${placeText}* <@${score.userId}> with *${score.achievementCount}* challenges completed\n`;
		}, '');
		const text = `*Here's the FitBot leaderboard!* :mega:`;
		await say({
			text,
			blocks: [
				{
					type: 'section',
					text: {
						type: 'mrkdwn',
						text,
					},
				},
				{
					type: 'section',
					text: {
						type: 'mrkdwn',
						text: topScoresSectionText,
					},
				},
			],
		});
	});

	registerCommand(app, '/my-score', async ({ command, ack, say }: SlackCommandMiddlewareArgs) => {
		log.info(`Received ${command.command} from ${command.user_id}`);
		await ack();
		const myScore = getUserScore(command.user_id);
		if (myScore.exerciseCounts?.length === 0) {
			const text = `You haven't completed any challenges yet, <@${command.user_id}>!`;
			await say({
				text,
				blocks: [
					{
						type: 'section',
						text: {
							type: 'mrkdwn',
							text,
						},
					},
				],
			});
			return;
		}
		const text = `Here's your score and totals, <@${command.user_id}>! You've completed *${myScore.achievementCount}* challenge(s). :100:`;
		await say({
			text,
			blocks: [
				{
					type: 'section',
					text: {
						type: 'mrkdwn',
						text,
					},
				},
				{
					type: 'section',
					text: {
						type: 'mrkdwn',
						text: getScoreText(myScore),
					},
				},
			],
		});
	});

	registerCommand(app, '/did-it', async ({ command, ack, say }: SlackCommandMiddlewareArgs) => {
		log.info(`Received ${command.command} from ${command.user_id}`);
		await ack();
		const result = completeChallenge(command.user_id);

		if (result === CompleteChallengeResult.Completed) {
			const encouragementEmoji = await getRandomMessage(MessageType.EncouragementEmojis);
			const congratulationMessage = await getRandomMessage(MessageType.Congratulations);
			const messageTemplate = `${encouragementEmoji} ${congratulationMessage}`;
			const messageFields = { user: `<@${command.user_id}>` };
			const text = render(messageTemplate, messageFields, { autoEscape: false }) as string;
			await say({
				text,
				blocks: [
					{
						type: 'section',
						text: {
							type: 'mrkdwn',
							text,
						},
					},
				],
			});
		} else if (result === CompleteChallengeResult.NotFound) {
			const text = `I haven't set any challenges yet, <@${command.user_id}>. Type \`/lets-go\` to get started!`;
			await say({
				text,
				blocks: [
					{
						type: 'section',
						text: {
							type: 'mrkdwn',
							text,
						},
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
				`*Here's the list of commands used by FitBot:*\n` +
				`\`/lets-go\` :point_right: Start a FitBot challenge.\n` +
				`\`/did-it\` :point_right: Tell FitBot you've completed a challenge.\n` +
				`\`/my-score\` :point_right: See how many challenges you've completed.\n` +
				`\`/top-scores\` :point_right: See the challenges leaderboard.\n` +
				`\`/help\` :point_right: Show this help message.`,
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
						text:
							`\`/lets-go\`  :point_right:  Start a FitBot challenge.\n` +
							`\`/did-it\`  :point_right:  Tell FitBot you've completed a challenge.\n` +
							`\`/my-score\`  :point_right:  See how many challenges you've completed.\n` +
							`\`/top-scores\`  :point_right:  See the challenges leaderboard.\n` +
							`\`/help\`  :point_right:  Show this help message.`,
					},
				},
			],
		});
	});
};

export { registerCommands };
