import bolt from '@slack/bolt';
import { showLogo } from './services/logo';
import { scheduleChallenge } from './services/challenge';
import { validateEnvs } from './util/helpers';
import { ScheduleType } from './types';
import { registerCommands } from './services/commands';
import { getLoggerByUrl } from './util/logger';
import { Logger } from 'log4js';

const log: Logger = getLoggerByUrl(import.meta.url);

showLogo();

validateEnvs(['SLACK_SIGNING_SECRET', 'SLACK_BOT_TOKEN', 'SLACK_CHANNEL_ID', 'SLACK_BOT_ID']);

const app = new bolt.App({
	token: process.env.SLACK_BOT_TOKEN,
	signingSecret: process.env.SLACK_SIGNING_SECRET,
	logLevel: bolt.LogLevel.INFO,
});

registerCommands(app);

(async () => {
	const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
	await app.start(port);
	log.info(`Started app on port ${port}`);
	await scheduleChallenge(ScheduleType.Random);
})();

export default {};
