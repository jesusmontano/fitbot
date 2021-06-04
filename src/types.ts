enum CountUnit {
	Reps,
	Seconds,
}

enum TimeUnit {
	Seconds = 'seconds',
	Minutes = 'minutes',
	Hours = 'hours',
}

interface CountRange {
	min: number;
	max: number;
	unit: CountUnit;
}

interface Exercise {
	name: string;
	messageTemplate: string;
	countRange: CountRange;
}

interface Delay {
	value: number;
	unit: TimeUnit;
	valueInMs: number;
}

interface Config {
	nextExerciseDelay: {
		min: number;
		max: number;
		unit: TimeUnit;
	};
	minimumExerciseUserGroupSize: number;
	exercises: Exercise[];
	messages: {
		congratulations: string[];
	};
}

interface Count {
	number: number;
	unit: CountUnit;
}

interface Challenge {
	name: string;
	message: string;
	count: Count;
	users: string[];
}

enum ScheduleType {
	Immediate,
	Random,
}

enum CompleteChallengeResult {
	Completed,
	NotFound,
}

export { Challenge, CountRange, Count, Exercise, Config, ScheduleType, CompleteChallengeResult, Delay, TimeUnit };
