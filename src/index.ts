import { App } from '@slack/bolt';
import dotenv from 'dotenv';
import { showLogo } from './services/logo';
import { generateChallenge } from './services/challenge';

dotenv.config();

// Initializes your app with your bot token and signing secret
const app = new App({
	token: process.env.SLACK_BOT_TOKEN,
	signingSecret: process.env.SLACK_SIGNING_SECRET,
});

(async () => {
	// Start your app
	const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
	await app.start(port);
	showLogo();
	await generateChallenge();
})();

export default {};
