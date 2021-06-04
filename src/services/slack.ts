import { WebClient, LogLevel } from '@slack/web-api';
import { Challenge } from 'types';

const client = new WebClient(process.env.SLACK_BOT_TOKEN, {
	logLevel: LogLevel.INFO,
});

const getFitbotUserId = async () => {
	const botInfo = await client.bots.info({ bot: process.env.SLACK_BOT_ID });
	if (!botInfo.ok) {
		console.log(`Can't get Slack bot info.`);
		process.exit(1);
	}
	return botInfo.bot?.user_id;
};

const getUsers = async () => {
	const channel = process.env.SLACK_CHANNEL_ID!;
	const fitbotUserId = await getFitbotUserId();
	const { members } = await client.conversations.members({ channel });
	if (!members) {
		console.log(`Can't get Slack conversation members.`);
		process.exit(1);
	}
	return members?.filter((member) => {
		return member !== fitbotUserId;
	});
};

const getUsersList = (users: string[]): string => {
	return users.map((user) => `<@${user}>`).join(' ');
};

const sendChallengeMessage = async (challenge: Challenge) => {
	const channel = process.env.SLACK_CHANNEL_ID!;
	const usersList = getUsersList(challenge.users);
	await client.chat.postMessage({
		channel,
		text: `:mega:* ${usersList}! You've been selected to complete the following challenge! ${challenge.message}`,
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
					text: `*Roll Call! :mega:* ${usersList}! You've been selected to complete the following challenge.`,
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
};

export { getUsers, sendChallengeMessage };
