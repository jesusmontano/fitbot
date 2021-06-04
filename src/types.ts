enum UNIT {
	reps,
	seconds,
}

interface CountRange {
	min: number;
	max: number;
	unit: UNIT;
}

interface Exercise {
	name: string;
	messageTemplate: string;
	countRange: CountRange;
}

interface Config {
	nextExerciseDelayMinutes: {
		min: number;
		max: number;
	};
	minimumExerciseUserGroupSize: number;
	exercises: Exercise[];
	messages: {
		congratulations: string[];
	};
}

interface Count {
	number: number;
	unit: UNIT;
}

interface Challenge {
	name: string;
	message: string;
	count: Count;
	users: string[];
}

export { Challenge, CountRange, Count, Exercise, Config };
