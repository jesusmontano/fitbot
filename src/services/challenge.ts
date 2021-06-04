import { getConfig } from './config';
import random from 'random';
import { render } from 'eta';
import { Challenge, Count, CountRange, Exercise } from '../types';

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
	return ['sdfdsf', '34f242'];
};

const generateChallenge = async (): Promise<Challenge> => {
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

export { generateChallenge };
