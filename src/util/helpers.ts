import { GenericMessageEvent, MessageEvent } from '@slack/bolt';
import { getLoggerByFilename } from './logger';
import { Logger } from 'log4js';

const log: Logger = getLoggerByFilename(__filename);
export const isGenericMessageEvent = (msg: MessageEvent): msg is GenericMessageEvent => {
	return (msg as GenericMessageEvent).subtype === undefined;
};

export const getRandomUser = (users: string[]): string => {
	return users[Math.floor(Math.random() * users.length)];
};

export const validateEnvs = (envNames: string[]) => {
	envNames.forEach((envName: string) => {
		if (process.env[envName] === '') {
			log.info(`Missing environment variable: ${envName}`);
			process.exit(1);
		}
	});
};
