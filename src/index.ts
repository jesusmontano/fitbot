import { App } from '@slack/bolt';
import dotenv from 'dotenv';
import { showLogo } from './services/logo';
import { generateChallenge } from './services/challenge';
import { isGenericMessageEvent } from './util/helpers';

dotenv.config();

// Initializes your app with your bot token and signing secret
const app = new App({
	token: process.env.SLACK_BOT_TOKEN,
	signingSecret: process.env.SLACK_SIGNING_SECRET,
});

// Listens to incoming messages that contain "hello"
app.message('hello', async ({ message, say }) => {
	// say() sends a message to the channel where the event was triggered
	if (!isGenericMessageEvent(message)) return;
	await say(`Hello, <@${message.user}>`);
});

(async () => {
	// Start your app
	const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
	await app.start(port);
	showLogo();
	await generateChallenge();
})();

export default {};
