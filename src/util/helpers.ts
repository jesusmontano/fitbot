import { Logger } from 'log4js';
import random from 'random';

import { Config, MessageType } from '../types';
import { getConfig } from '../services/config';
import { getLoggerByUrl } from './logger';

const log: Logger = getLoggerByUrl(import.meta.url);

const getRandomUser = (users: string[]): string => {
	return users[Math.floor(Math.random() * users.length)];
};

const validateEnvs = (envNames: string[]) => {
	envNames.forEach((envName: string) => {
		if (process.env[envName] === '') {
			log.info(`Missing environment variable: ${envName}`);
			process.exit(1);
		}
	});
};

const getRandomMessage = async (messageType: MessageType) => {
	const config: Config = await getConfig();
	const messages: string[] = config.messages[messageType];
	const messageIndex = random.int(0, messages.length - 1);
	return messages[messageIndex];
};

export { getRandomUser, validateEnvs, getRandomMessage };
