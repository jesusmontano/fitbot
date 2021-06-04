import { readFile } from 'fs/promises';
import { Config } from '../types';

const CONFIG_FILE_PATH = './data/config.json';

const getConfig = async (): Promise<Config> => {
	const configString = await readFile(CONFIG_FILE_PATH, 'utf8');
	return JSON.parse(configString);
};

export { getConfig };
