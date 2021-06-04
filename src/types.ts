enum Unit {
	Reps,
	Seconds,
}

interface CountRange {
	min: number;
	max: number;
	unit: Unit;
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
	unit: Unit;
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

export { Challenge, CountRange, Count, Exercise, Config, ScheduleType };
