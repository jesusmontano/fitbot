import { Logger } from 'log4js';
import { render } from 'eta';
import arrayShuffle from 'array-shuffle';
import random from 'random';

import {
	Challenge,
	ChallengeStatus,
	Count,
	CountRange,
	Delay,
	Exercise,
	SlackAPIRate,
	ScheduleType,
	TimeUnit,
} from '../types';
import { getActiveUsers, getUsers, GET_USER_PRESENCE_CHUNK_SIZE } from './users';
import { getConfig } from '../util/config';
import { getLoggerByUrl } from '../util/logger';
import { sendChallengeMessage, sendNotifyOfSlownessMessage } from './messages';
import { getChallengeStatus, getSlackAPIRate, storeChallenge, updateChallengeStatus } from '../DAO/challenges';

const log: Logger = getLoggerByUrl(import.meta.url);

const getCount = (countRange: CountRange): Count => {
	const number = random.int(countRange.min, countRange.max);
	return {
		number,
		unit: countRange.unit,
	};
};

const getRandomExercise = async (): Promise<Exercise> => {
	const config = await getConfig();
	const exerciseId = random.int(0, config.exercises.length - 1);
	return config.exercises[exerciseId];
};

const getRandomActiveUsers = async (users: string[]): Promise<string[]> => {
	const activeUsers = await getActiveUsers(users);
	if (activeUsers.length === 0) {
		return activeUsers;
	}
	const shuffledUsers = arrayShuffle(activeUsers);
	const config = await getConfig();
	const minGroupSize =
		config.minimumExerciseUserGroupSize > users.length ? users.length : config.minimumExerciseUserGroupSize;
	const exerciseUserGroupSize = random.int(minGroupSize, users.length);
	return shuffledUsers.slice(0, exerciseUserGroupSize);
};

export const generateChallenge = async (): Promise<Challenge> => {
	const exercise = await getRandomExercise();
	const { name, messageTemplate, countRange } = exercise;
	const count = getCount(countRange);
	const message = render(messageTemplate, count, { autoEscape: false }) as string;
	return {
		name,
		message,
		count,
		users: [],
		date: new Date(),
		status: ChallengeStatus.GettingUserPresence,
	};
};

const getValueInMs = (value: number, unit: TimeUnit) => {
	switch (unit) {
		case TimeUnit.Seconds:
			return value * 1000;
		case TimeUnit.Minutes:
			return value * 1000 * 60;
		case TimeUnit.Hours:
			return value * 1000 * 60 * 60;
		default:
			log.info(`Unexpected time unit.`);
			process.exit(1);
	}
};

const getNextChallengeDelaySeconds = async (scheduleType: ScheduleType): Promise<Delay> => {
	if (scheduleType === ScheduleType.Immediate) {
		return {
			value: 0,
			unit: TimeUnit.Seconds,
			valueInMs: 0,
		};
	} else if (scheduleType === ScheduleType.SixtySecondDelay) {
		return {
			value: 60,
			unit: TimeUnit.Seconds,
			valueInMs: 60000,
		};
	}
	const config = await getConfig();
	const value = random.int(config.nextExerciseDelay.min, config.nextExerciseDelay.max);
	const unit = config.nextExerciseDelay.unit;
	const valueInMs = getValueInMs(value, unit);
	return { value, unit, valueInMs };
};

let scheduledChallengeTimer: NodeJS.Timeout | null = null;

const cancelUnstartedChallenge = async () => {
	const challengeStatus = await getChallengeStatus();
	if (challengeStatus === ChallengeStatus.GettingUserPresence) {
		await updateChallengeStatus(ChallengeStatus.Cancelled);
	}
};

const scheduleChallenge = async (scheduleType: ScheduleType): Promise<void> => {
	const delay = await getNextChallengeDelaySeconds(scheduleType);
	if (delay.value > 0) {
		log.info(`Scheduling a challenge in ${delay.value} ${delay.unit}(s)`);
	}
	if (scheduledChallengeTimer !== null) {
		clearTimeout(scheduledChallengeTimer);
	}
	scheduledChallengeTimer = setTimeout(async () => {
		log.info('Challenge triggered.');
		const slackAPIRate = await getSlackAPIRate();
		if (slackAPIRate === SlackAPIRate.Throttled) {
			const challengeStatus = await getChallengeStatus();
			if (challengeStatus === ChallengeStatus.GettingUserPresence) {
				log.info('Cancelling challenge due to challenge already being processed.');
				return;
			}
			log.info('Postponing challenge due to Slack API rate throttling.');
			await scheduleChallenge(ScheduleType.SixtySecondDelay);
			return;
		}
		const users = await getUsers();
		if (scheduleType === ScheduleType.Immediate && users.length > GET_USER_PRESENCE_CHUNK_SIZE) {
			await sendNotifyOfSlownessMessage(users.length);
		}
		const challenge = await generateChallenge();
		await storeChallenge(challenge);
		challenge.users = await getRandomActiveUsers(users);
		if (challenge.users.length === 0) {
			log.info('Postponing challenge due to no active users found');
			await updateChallengeStatus(ChallengeStatus.Cancelled);
			await scheduleChallenge(ScheduleType.Random);
			return;
		}
		log.info('Sending challenge', challenge);
		await updateChallengeStatus(ChallengeStatus.Started);
		await sendChallengeMessage(challenge, scheduleType);
		await scheduleChallenge(ScheduleType.Random);
	}, delay.valueInMs);
};

export { cancelUnstartedChallenge, scheduleChallenge };
