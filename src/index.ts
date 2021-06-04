import { App } from '@slack/bolt';
import { showLogo } from './services/logo';
import { scheduleChallenge } from './services/challenge';
import { validateEnvs } from './util/helpers';
import { ScheduleType } from './types';
import { registerTriggers } from './services/commands';
import { getLoggerByFilename } from './util/logger';
import { Logger } from 'log4js';

const log: Logger = getLoggerByFilename(__filename);

showLogo();

validateEnvs(['SLACK_SIGNING_SECRET', 'SLACK_BOT_TOKEN', 'SLACK_CHANNEL_ID', 'SLACK_BOT_ID']);

const app = new App({
	token: process.env.SLACK_BOT_TOKEN,
	signingSecret: process.env.SLACK_SIGNING_SECRET,
});

registerTriggers(app);

(async () => {
	const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
	await app.start(port);
	log.info(`Started app on port ${port}`);
	// await scheduleChallenge(ScheduleType.Random);
	await scheduleChallenge(ScheduleType.Immediate);
})();

export default {};
