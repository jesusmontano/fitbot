import { getConfig } from './config';
import random from 'random';
import { render } from 'eta';
import { Challenge, Count, CountRange, Delay, Exercise, ScheduleType, TimeUnit } from '../types';
import { getUsers, sendChallengeMessage } from './slack';
import arrayShuffle from 'array-shuffle';
import { storeChallenge } from './database';
import { getLoggerByFilename } from '../util/logger';
import { Logger } from 'log4js';

const log: Logger = getLoggerByFilename(__filename);

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

const getRandomUsers = async (): Promise<string[]> => {
	const users = await getUsers();
	const shuffledUsers = arrayShuffle(users);
	const config = await getConfig();
	const minGroupSize =
		config.minimumExerciseUserGroupSize > users.length ? users.length : config.minimumExerciseUserGroupSize;
	const exerciseUserGroupSize = random.int(minGroupSize, users.length);
	return shuffledUsers.slice(0, exerciseUserGroupSize);
};

export const generateChallenge = async (): Promise<Challenge> => {
	const exercise = await getRandomExercise();
	const users = await getRandomUsers();
	const { name, messageTemplate, countRange } = exercise;
	const count = getCount(countRange);
	const message = render(messageTemplate, count, { autoEscape: false }) as string;
	return {
		name,
		message,
		count,
		users,
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

const getNextExerciseDelaySeconds = async (scheduleType: ScheduleType): Promise<Delay> => {
	if (scheduleType === ScheduleType.Immediate) {
		return {
			value: 0,
			unit: TimeUnit.Seconds,
			valueInMs: 0,
		};
	}
	const config = await getConfig();
	const value = random.int(config.nextExerciseDelay.min, config.nextExerciseDelay.max);
	const unit = config.nextExerciseDelay.unit;
	const valueInMs = getValueInMs(value, unit);
	return { value, unit, valueInMs };
};

let scheduledChallengeTimer: NodeJS.Timeout | null = null;

const scheduleChallenge = async (scheduleType: ScheduleType): Promise<void> => {
	const delay = await getNextExerciseDelaySeconds(scheduleType);
	if (delay.value > 0) {
		log.info(`Scheduling a challenge in ${delay.value} ${delay.unit}(s)`);
	}
	if (scheduledChallengeTimer !== null) {
		clearTimeout(scheduledChallengeTimer);
	}
	scheduledChallengeTimer = setTimeout(async () => {
		const challenge = await generateChallenge();
		log.info('Sending challenge', challenge);
		storeChallenge(challenge);
		await sendChallengeMessage(challenge, scheduleType);
		scheduleChallenge(ScheduleType.Random);
	}, delay.valueInMs);
};

export { scheduleChallenge };
