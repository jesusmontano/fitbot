import { App } from '@slack/bolt';
import dotenv from 'dotenv';
import { showLogo } from './services/logo';
import { scheduleChallenge } from './services/challenge';
import { getRandomUser } from './util/helpers';
import { ScheduleType } from './types';

dotenv.config();

// Initializes your app with your bot token and signing secret
const app = new App({
	token: process.env.SLACK_BOT_TOKEN,
	signingSecret: process.env.SLACK_SIGNING_SECRET,
});

// Listens to incoming messages that contain "!hello"
app.message('!hello', async ({ message, say, client }) => {
	const { members } = await client.conversations.members({ channel: message.channel });
	if (!members) return;
	// say() sends a message to the channel where the event was triggered
	await say(`Hey, <@${getRandomUser(members)}>! It's time to move around!`);
});

(async () => {
	// Start your app
	const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
	await app.start(port);
	showLogo();
	console.log(`Started app on port ${port}`);
	await scheduleChallenge(ScheduleType.Immediate);
})();

export default {};
