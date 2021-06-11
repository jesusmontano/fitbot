import { Logger } from 'log4js';
import bolt from '@slack/bolt';

import { getLoggerByUrl } from './util/logger';
import { registerCommands } from './services/commands';
import { cancelUnstartedChallenge, scheduleChallenge } from './services/challenge';
import { ScheduleType } from './types';
import { showLogo } from './util/logo';
import { validateEnvs } from './util/env';

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
	await cancelUnstartedChallenge();
	await scheduleChallenge(ScheduleType.Random);
})();

export default {};
