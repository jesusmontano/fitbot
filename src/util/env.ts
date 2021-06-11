import { Logger } from 'log4js';

import { getLoggerByUrl } from './logger';

const log: Logger = getLoggerByUrl(import.meta.url);

const validateEnvs = (envNames: string[]) => {
	envNames.forEach((envName: string) => {
		if (process.env[envName] === '') {
			log.info(`Missing environment variable: ${envName}`);
			process.exit(1);
		}
	});
};

export { validateEnvs };
