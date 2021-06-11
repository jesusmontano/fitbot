import _ from 'lodash';
import { Logger } from 'log4js';
import { setTimeout } from 'timers/promises';
import pMap from 'p-map';
import pReduce from 'p-reduce';

import { getLoggerByUrl } from '../util/logger';
import { client } from '../util/slack';

const log: Logger = getLoggerByUrl(import.meta.url);

const GET_USER_PRESENCE_CHUNK_SIZE = 50;
const API_LIMIT_DELAY_SEC = 60;

const getFitbotUserId = async () => {
	const botInfo = await client.bots.info({ bot: process.env.SLACK_BOT_ID });
	if (!botInfo.ok) {
		log.info(`Can't get Slack bot info.`);
		process.exit(1);
	}
	return botInfo.bot?.user_id;
};

const getUsers = async (): Promise<string[]> => {
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

export { GET_USER_PRESENCE_CHUNK_SIZE, getActiveUsers, getUsers };
