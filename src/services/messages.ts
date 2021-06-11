import { render } from 'eta';
import _ from 'lodash';
import { setTimeout } from 'timers/promises';

import { Challenge, ExerciseCount, MessageType, ScheduleType, Score } from '../types';
import { getConfig, getRandomMessage } from '../util/config';
import { client } from '../util/slack';

const channel = process.env.SLACK_CHANNEL_ID!;

const pause = async (factor: number = 1) => {
	const config = await getConfig();
	await setTimeout(config.messageDelaySeconds * 1000 * factor);
};

const sendChallengeMessage = async (challenge: Challenge, scheduleType: ScheduleType) => {
	const usersList = getUsersList(challenge.users);
	if (scheduleType === ScheduleType.Random) {
		const text = `*Hey there!* :wave: I'm FitBot. I'm here to help you get in shape!`;
		await client.chat.postMessage({
			channel,
			text,
			blocks: [
				{
					type: 'section',
					text: {
						type: 'mrkdwn',
						text,
					},
				},
			],
		});
	}
	const challengeText =
		`*Roll Call! :mega:* ${usersList}!\n` +
		`You've been selected to do the following challenge:\n` +
		`*Challenge! :stopwatch:* ${challenge.message}`;
	await client.chat.postMessage({
		channel,
		text: challengeText,
		blocks: [
			{
				type: 'section',
				text: {
					type: 'mrkdwn',
					text: challengeText,
				},
			},
		],
	});
	await pause();
	const helpText = `Let me know you've completed it by typing \`/did-it\`\n For more commands type \`/fitbot-help\``;
	await client.chat.postMessage({
		channel,
		text: helpText,
		blocks: [
			{
				type: 'section',
				text: {
					type: 'mrkdwn',
					text: helpText,
				},
			},
		],
	});
};

const getUsersList = (users: string[]): string => {
	return users.map((user) => `<@${user}>`).join(' ');
};

const sendChallengeCompletedMessage = async (userId: string) => {
	const encouragementEmoji = await getRandomMessage(MessageType.EncouragementEmojis);
	const congratulationMessage = await getRandomMessage(MessageType.Congratulations);
	const messageTemplate = `${encouragementEmoji} ${congratulationMessage}`;
	const messageFields = { user: `<@${userId}>` };
	const text = render(messageTemplate, messageFields, { autoEscape: false }) as string;
	await client.chat.postMessage({
		channel,
		text,
		blocks: [
			{
				type: 'section',
				text: {
					type: 'mrkdwn',
					text,
				},
			},
		],
	});
};

const sendHelpMessage = async () => {
	const text =
		`\`/lets-go\`  :point_right:  Start a FitBot challenge.\n` +
		`\`/did-it\`  :point_right:  Tell FitBot you've completed a challenge.\n` +
		`\`/my-score\`  :point_right:  See how many challenges you've completed.\n` +
		`\`/top-scores\`  :point_right:  See the challenges leaderboard.\n` +
		`\`/help\`  :point_right:  Show this help message.`;
	await client.chat.postMessage({
		channel,
		text,
		blocks: [
			{
				type: 'section',
				text: {
					type: 'mrkdwn',
					text: `*Here's the list of commands used by FitBot:*`,
				},
			},
			{
				type: 'section',
				text: {
					type: 'mrkdwn',
					text,
				},
			},
		],
	});
};

const sendLeaderboardMessage = async (topScores: Score[]) => {
	const topScoresText = topScores.reduce((output, score, place) => {
		const placeText = getPlaceText(place);
		return output + `*${placeText}* <@${score.userId}> with *${score.achievementCount}* challenges completed\n`;
	}, '');
	const text = `*Here's the FitBot leaderboard!* :mega:`;
	await client.chat.postMessage({
		channel,
		text,
		blocks: [
			{
				type: 'section',
				text: {
					type: 'mrkdwn',
					text,
				},
			},
			{
				type: 'section',
				text: {
					type: 'mrkdwn',
					text: topScoresText,
				},
			},
		],
	});
};

const getPlaceText = (place: number): string => {
	switch (place) {
		case 0: {
			return '#1 :first_place_medal:';
		}
		case 1: {
			return '#2 :second_place_medal:';
		}
		case 2: {
			return '#3 :third_place_medal:';
		}
		default: {
			return `#${place + 1}`;
		}
	}
};

const sendLetsGoMessage = async (userId: string) => {
	const text = `I hear you <@${userId}>, *lets go!* :muscle:`;
	await client.chat.postMessage({
		channel,
		text,
		blocks: [
			{
				type: 'section',
				text: {
					type: 'mrkdwn',
					text,
				},
			},
		],
	});
};

const sendNoChallengesCompletedMessage = async () => {
	const text = `No challenges have been completed, yet!`;
	await client.chat.postMessage({
		channel,
		text,
		blocks: [
			{
				type: 'section',
				text: {
					type: 'mrkdwn',
					text,
				},
			},
		],
	});
};

const sendNoChallengesSetMessage = async (userId: string) => {
	const text = `I haven't set any challenges yet, <@${userId}>. Type \`/lets-go\` to get started!`;
	await client.chat.postMessage({
		channel,
		text,
		blocks: [
			{
				type: 'section',
				text: {
					type: 'mrkdwn',
					text,
				},
			},
		],
	});
};

const sendNoPersonalChallengesCompletedMessage = async (userId: string) => {
	const text = `You haven't completed any challenges yet, <@${userId}>!`;
	await client.chat.postMessage({
		channel,
		text,
		blocks: [
			{
				type: 'section',
				text: {
					type: 'mrkdwn',
					text,
				},
			},
		],
	});
};

const sendNotifyOfSlownessMessage = async (userCount: number) => {
	const waitInMinutes = Math.ceil(userCount / 50);
	const text = `Due to the number of users in this channel and Slack API limitations it will take ${waitInMinutes} minutes to trigger the challenge, sit tight!`;
	await client.chat.postMessage({
		channel,
		text,
		blocks: [
			{
				type: 'section',
				text: {
					type: 'mrkdwn',
					text,
				},
			},
		],
	});
};

const sendMyScoresMessage = async (userId: string, myScore: Score) => {
	const text = `Here's your score and totals, <@${userId}>! You've completed *${myScore.achievementCount}* challenge(s). :100:`;
	await client.chat.postMessage({
		channel,
		text,
		blocks: [
			{
				type: 'section',
				text: {
					type: 'mrkdwn',
					text,
				},
			},
			{
				type: 'section',
				text: {
					type: 'mrkdwn',
					text: getScoreText(myScore),
				},
			},
		],
	});
};

const getScoreText = (score: Score): string => {
	return score.exerciseCounts!.reduce((output, exerciseCount: ExerciseCount) => {
		return output + `${exerciseCount.exerciseName}: *${exerciseCount.count} ${exerciseCount.countUnit}*\n`;
	}, '');
};

const sendSixtySecondGapNeededMessage = async () => {
	const text = `Due to Slack API rate limits there needs to be a 60 second gap between challenges. Try again shortly!`;
	await client.chat.postMessage({
		text,
		channel,
		blocks: [
			{
				type: 'section',
				text: {
					type: 'mrkdwn',
					text,
				},
			},
		],
	});
};

export {
	pause,
	sendChallengeCompletedMessage,
	sendChallengeMessage,
	sendHelpMessage,
	sendLeaderboardMessage,
	sendLetsGoMessage,
	sendMyScoresMessage,
	sendNoChallengesCompletedMessage,
	sendNoChallengesSetMessage,
	sendNoPersonalChallengesCompletedMessage,
	sendNotifyOfSlownessMessage,
	sendSixtySecondGapNeededMessage,
};
