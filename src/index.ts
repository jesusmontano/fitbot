import { App } from '@slack/bolt';
import dotenv from 'dotenv';
import { showLogo } from './services/logo';
import { scheduleChallenge, generateChallenge } from './services/challenge';
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
	const challenge = await generateChallenge();
	const selectedMember = getRandomUser(members);
	// say() sends a message to the channel where the event was triggered
	await say({
		//  It's a best practice to always provide a `text` argument when posting a message.
		// The `text` is used in places where the content cannot be rendered such as:
		// system push notifications, assistive technology such as screen readers, etc.
		text: `:mega:* <@${selectedMember}>! You've been selected to complete the following challenge! ${challenge.message}`,
		blocks: [
			{
				type: 'section',
				text: {
					type: 'mrkdwn',
					text: "Hey there! :wave: I'm FitBot. I'm here to help you get in shape!",
				},
			},
			{
				type: 'divider',
			},
			{
				type: 'section',
				text: {
					type: 'mrkdwn',
					text: `*Roll Call! :mega:* <@${selectedMember}>! You've been selected to complete the following challenge.`,
				},
			},
			{
				type: 'section',
				text: {
					type: 'mrkdwn',
					text: `*Challenge! :stopwatch:* ${challenge.message}`,
				},
			},
			{
				type: 'divider',
			},
		],
	});
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
