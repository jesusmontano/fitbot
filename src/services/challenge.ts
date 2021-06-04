import { getConfig } from './config';
import random from 'random';
import { render } from 'eta';
import { Challenge, Count, CountRange, Exercise, ScheduleType } from '../types';
import { getUsers, sendChallengeMessage } from './slack';
import arrayShuffle from 'array-shuffle';

const getCount = (countRange: CountRange): Count => {
	const number = random.int(countRange.min, countRange.max);
	return {
		number,
		unit: countRange.unit,
	};
};

const getMessage = (messageTemplate: string, count: Count): string => {
	return render(messageTemplate, count) as string;
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
	const message = getMessage(messageTemplate, count);
	return {
		name,
		message,
		count,
		users,
	};
};

const getNextExerciseDelayMinutes = async (scheduleType: ScheduleType): Promise<number> => {
	if (scheduleType === ScheduleType.Immediate) {
		return 0;
	}
	const config = await getConfig();
	return random.int(config.nextExerciseDelayMinutes.min, config.nextExerciseDelayMinutes.max);
};

let scheduledChallengeTimer: NodeJS.Timeout | null = null;

const scheduleChallenge = async (scheduleType: ScheduleType): Promise<void> => {
	const delayMinutes = await getNextExerciseDelayMinutes(scheduleType);
	if (delayMinutes > 0) {
		console.log(`Scheduling challenge in ${delayMinutes} minute(s)`);
	}
	if (scheduledChallengeTimer !== null) {
		clearTimeout(scheduledChallengeTimer);
	}
	scheduledChallengeTimer = setTimeout(async () => {
		const challenge = await generateChallenge();
		await sendChallengeMessage(challenge);
		scheduleChallenge(ScheduleType.Random);
	}, delayMinutes * 1000 * 60);
};

export { scheduleChallenge };
