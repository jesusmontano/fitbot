import _ from 'lodash';
import { Logger } from 'log4js';
import { setTimeout } from 'timers/promises';
import { WebClient, LogLevel } from '@slack/web-api';
import pMap from 'p-map';
import pReduce from 'p-reduce';

import { Challenge, ScheduleType } from '../types';
import { getConfig } from './config';
import { getLoggerByUrl } from '../util/logger';

const log: Logger = getLoggerByUrl(import.meta.url);

const GET_USER_PRESENCE_CHUNK_SIZE = 50;
const API_LIMIT_DELAY_SEC = 60;

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
	// TODO should iterate all the pages of members
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

const getActiveUsers = async (users: string[]): Promise<string[]> => {
	const usersChunks: string[][] = _.chunk(users, GET_USER_PRESENCE_CHUNK_SIZE);
	const result: string[] = await pReduce(
		usersChunks,
		async (output: string[], usersChunk: string[], index): Promise<string[]> => {
			log.info(`Getting user presence, chunk ${index + 1}/${usersChunks.length} (${usersChunk.length} users)`);
			const usersPresence = await pMap(usersChunk, (user) => {
				return client.users.getPresence({ user });
			});
			const activeUsers = usersPresence.reduce((output2: string[], userPresence, index): string[] => {
				if (userPresence.presence === 'active') {
					output2.push(usersChunk[index]);
				}
				return output2;
			}, []);
			if (usersChunks.length > index + 1) {
				log.info(`Waiting for ${API_LIMIT_DELAY_SEC} seconds to avoid Slack API limits`);
				await setTimeout(API_LIMIT_DELAY_SEC * 1000);
			}
			output.push(...activeUsers);
			return output;
		},
		[],
	);
	return result;
};

const sendNotifyOfSlownessMessage = async (userCount: number) => {
	const channel = process.env.SLACK_CHANNEL_ID!;
	const waitInMinutes = Math.ceil(userCount / 50);
	const text = `Due to the number of users in this channel and Slack API limitations it will take ${waitInMinutes} minutes to trigger the challenge, sit tight!`;
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
		`*Roll Call! :mega:* ${usersList}!\n` +
		`You've been selected to do the following challenge: (but everyone can join in)\n` +
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

export {
	getUsers,
	getActiveUsers,
	sendChallengeMessage,
	getClient,
	sendNotifyOfSlownessMessage,
	GET_USER_PRESENCE_CHUNK_SIZE,
};
