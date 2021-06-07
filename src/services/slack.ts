import { WebClient, LogLevel } from '@slack/web-api';
import { Challenge, ScheduleType } from '../types';
import { getLoggerByFilename } from '../util/logger';
import { Logger } from 'log4js';
import { setTimeout } from 'timers/promises';
import { getConfig } from './config';

const log: Logger = getLoggerByFilename(__filename);

const client = new WebClient(process.env.SLACK_BOT_TOKEN, {
	logLevel: LogLevel.INFO,
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
	const channel = process.env.SLACK_CHANNEL_ID!;
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

const getUsersList = (users: string[]): string => {
	return users.map((user) => `<@${user}>`).join(' ');
};

const sendChallengeMessage = async (challenge: Challenge, scheduleType: ScheduleType) => {
	const channel = process.env.SLACK_CHANNEL_ID!;
	const usersList = getUsersList(challenge.users);
	const config = await getConfig();
	if (scheduleType === ScheduleType.Random) {
		const text = `*Hey there!* :wave: I'm FitBot. I'm here to help you get in shape!`;
		await client.chat.postMessage({
			channel,
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
		await setTimeout(config.messageDelaySeconds * 1000);
	}
	const challengeText =
		`*Roll Call! :mega:* ${usersList}! You've been selected to do the following challenge:\n` +
		`*Challenge! :stopwatch:* ${challenge.message}`;
	await client.chat.postMessage({
		channel,
		text: challengeText,
		blocks: [
			{
				type: 'section',
				text: {
					type: 'mrkdwn',
					text: challengeText,
				},
			},
		],
	});
	await setTimeout(config.messageDelaySeconds * 1000);
	const helpText = `Let me know you've completed it by typing \`/did-it\`\n For more commands type \`/fitbot-help\``;
	await client.chat.postMessage({
		channel,
		text: helpText,
		blocks: [
			{
				type: 'section',
				text: {
					type: 'mrkdwn',
					text: helpText,
				},
			},
		],
	});
};

const getClient = () => client;

export { getUsers, sendChallengeMessage, getClient };
