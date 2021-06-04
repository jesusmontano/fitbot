import { App } from '@slack/bolt';
import { showLogo } from './services/logo';
import { scheduleChallenge, generateChallenge } from './services/challenge';
import { getRandomUser, validateEnvs, isGenericMessageEvent } from './util/helpers';
import { ScheduleType } from './types';

validateEnvs(['SLACK_SIGNING_SECRET', 'SLACK_BOT_TOKEN', 'SLACK_CHANNEL_ID', 'SLACK_BOT_ID']);

// Initializes your app with your bot token and signing secret
const app = new App({
	token: process.env.SLACK_BOT_TOKEN,
	signingSecret: process.env.SLACK_SIGNING_SECRET,
});

// Listens to incoming messages that contain "!lets-go"
app.message('!lets-go', async ({ message, say, client }) => {
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
			{
				type: 'section',
				text: {
					type: 'mrkdwn',
					text: `*Reminder! :exclamation:* Remember to use the "*!did-it*" command after completing your challenge to add it to your score.`,
				},
			},
		],
	});
});

// Listens to incoming messages that contain "!top-scores"
app.message('!top-scores', async ({ message, say, client }) => {
	await say({
		text: `:mega:* Here are the top performers on FitBot!`,
		blocks: [
			{
				type: 'section',
				text: {
					type: 'mrkdwn',
					text: '*Here are the top scores!* :mega: ',
				},
			},
			{
				type: 'divider',
			},
			{
				type: 'section',
				text: {
					type: 'mrkdwn',
					text: ':first_place_medal: Jim',
				},
			},
			{
				type: 'divider',
			},
			{
				type: 'section',
				text: {
					type: 'mrkdwn',
					text: ':second_place_medal: Luis',
				},
			},
			{
				type: 'divider',
			},
			{
				type: 'section',
				text: {
					type: 'mrkdwn',
					text: ':third_place_medal: Jesus',
				},
			},
		],
	});
});

// Listens to incoming messages that contain "!my-score"
app.message('!my-score', async ({ message, say, client }) => {
	if (!isGenericMessageEvent(message)) return;

	await say({
		text: `:100: Here's your score, <@${message.user}>! \n` + `Push-ups: 100 \n` + `Ski-sits: 60 \n`,
		blocks: [
			{
				type: 'section',
				text: {
					type: 'mrkdwn',
					text: `*Here's your score, <@${message.user}>!* :100: \n` + `Push-ups: 100 \n` + `Ski-sits: 60 \n`,
				},
			},
		],
	});
});

app.message('!did-it', async ({ message, say, client }) => {
	if (!isGenericMessageEvent(message)) return;

	await say({
		text: `:tada: Congratulations on completing your most recent challenge, <@${message.user}>!`,
		blocks: [
			{
				type: 'section',
				text: {
					type: 'mrkdwn',
					text: `:tada: Congratulations on completing your most recent challenge, <@${message.user}>!`,
				},
			},
		],
	});
});

app.message('!help', async ({ message, say, client }) => {
	await say({
		blocks: [
			{
				type: 'section',
				text: {
					type: 'mrkdwn',
					text: `*Here's the list of commands used by FitBot.*`,
				},
			},
			{
				type: 'divider',
			},
			{
				type: 'section',
				text: {
					type: 'mrkdwn',
					text: `*!top-scores* :point_right: Returns the top performers.`,
				},
			},
			{
				type: 'divider',
			},
			{
				type: 'section',
				text: {
					type: 'mrkdwn',
					text: `*!my-score* :point_right: Returns your score.`,
				},
			},
			{
				type: 'divider',
			},
			{
				type: 'section',
				text: {
					type: 'mrkdwn',
					text: `*!did-it* :point_right: Confirms that you completed your challenge so that it can be added to your score.`,
				},
			},
			{
				type: 'divider',
			},
			{
				type: 'section',
				text: {
					type: 'mrkdwn',
					text: `*!lets-go* :point_right: Triggers FitBot to give you a challenge right away.`,
				},
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
