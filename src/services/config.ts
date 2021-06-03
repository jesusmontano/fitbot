import { readFile } from 'fs/promises';

const CONFIG_FILE_PATH = './data/config.json';

const getConfig = async () => {
	try {
		const configString = await readFile(CONFIG_FILE_PATH, 'utf8');
		return JSON.parse(configString);
	} catch (err) {
		// When a request is aborted - err is an AbortError
		console.error(err);
	}
};

export { getConfig };
