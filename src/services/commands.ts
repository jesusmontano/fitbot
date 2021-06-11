import { App, Middleware, SlackCommandMiddlewareArgs } from '@slack/bolt';
import { Logger } from 'log4js';

import { completeChallenge, getSlackAPIRate } from '../DAO/challenges';
import { CompleteChallengeResult, SlackAPIRate, ScheduleType } from '../types';
import { getLoggerByUrl } from '../util/logger';
import { getTopScores, getUserScore } from '../DAO/achievements';
import { scheduleChallenge } from './challenge';
import {
	pause,
	sendChallengeCompletedMessage,
	sendHelpMessage,
	sendLeaderboardMessage,
	sendLetsGoMessage,
	sendMyScoresMessage,
	sendNoChallengesCompletedMessage,
	sendNoChallengesSetMessage,
	sendNoPersonalChallengesCompletedMessage,
	sendSixtySecondGapNeededMessage,
} from './messages';

const log: Logger = getLoggerByUrl(import.meta.url);

const registerCommand = (app: App, trigger: string | RegExp, callback: Middleware<SlackCommandMiddlewareArgs>) => {
	log.info(`Registering command trigger ${trigger}`);
	app.command(trigger, callback);
};

const registerCommands = (app: App) => {
	registerCommand(app, '/lets-go', async ({ command, ack, say }: SlackCommandMiddlewareArgs) => {
		log.info(`Received ${command.command} from ${command.user_id}`);
		await ack();
		const slackAPIThrottle = await getSlackAPIRate();
		if (slackAPIThrottle === SlackAPIRate.Throttled) {
			await sendSixtySecondGapNeededMessage();
			return;
		}
		await sendLetsGoMessage(command.user_id);
		await pause(0.66);
		await scheduleChallenge(ScheduleType.Immediate);
	});

	registerCommand(app, '/top-scores', async ({ command, ack, say }: SlackCommandMiddlewareArgs) => {
		log.info(`Received ${command.command} from ${command.user_id}`);
		await ack();
		const topScores = await getTopScores(10);
		if (topScores.length === 0) {
			await sendNoChallengesCompletedMessage();
			return;
		}
		await sendLeaderboardMessage(topScores);
	});

	registerCommand(app, '/my-score', async ({ command, ack, say }: SlackCommandMiddlewareArgs) => {
		log.info(`Received ${command.command} from ${command.user_id}`);
		await ack();
		const myScore = await getUserScore(command.user_id);
		if (myScore.exerciseCounts?.length === 0) {
			await sendNoPersonalChallengesCompletedMessage(command.user_id);
			return;
		}
		await sendMyScoresMessage(command.user_id, myScore);
	});

	registerCommand(app, '/did-it', async ({ command, ack, say }: SlackCommandMiddlewareArgs) => {
		log.info(`Received ${command.command} from ${command.user_id}`);
		await ack();
		const result = await completeChallenge(command.user_id);

		if (result === CompleteChallengeResult.Completed) {
			await sendChallengeCompletedMessage(command.user_id);
		} else if (result === CompleteChallengeResult.NotFound) {
			await sendNoChallengesSetMessage(command.user_id);
		}
	});

	registerCommand(app, '/fitbot-help', async ({ command, ack, say }: SlackCommandMiddlewareArgs) => {
		log.info(`Received ${command.command} from ${command.user_id}`);
		await ack();
		await sendHelpMessage();
	});
};

export { registerCommands };
