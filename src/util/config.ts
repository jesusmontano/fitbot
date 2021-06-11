import { readFile } from 'fs/promises';
import random from 'random';

import { Config, MessageType } from '../types';

const CONFIG_FILE_PATH = './data/config.json';

const getConfig = async (): Promise<Config> => {
	const configString = await readFile(CONFIG_FILE_PATH, 'utf8');
	return JSON.parse(configString);
};

const getRandomMessage = async (messageType: MessageType) => {
	const config: Config = await getConfig();
	const messages: string[] = config.messages[messageType];
	const messageIndex = random.int(0, messages.length - 1);
	return messages[messageIndex];
};

export { getRandomMessage, getConfig };
