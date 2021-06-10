enum CountUnit {
	Reps = 'reps',
	Seconds = 'seconds',
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
		encouragementEmojis: string[];
	};
	messageDelaySeconds: number;
}

enum MessageType {
	Congratulations = 'congratulations',
	EncouragementEmojis = 'encouragementEmojis',
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
	AlreadyCompleted,
	Completed,
	NotFound,
}

interface Score {
	userId: string;
	achievementCount: number;
	exerciseCounts?: ExerciseCount[];
}

interface ExerciseCount {
	exerciseName: string;
	count: number;
	countUnit: string;
}

interface ChallengeEntity {
	id: string;
	exerciseName: string;
	count: number;
	countUnit: CountUnit;
	date: Date;
}

interface AchievementEntity {
	id: string;
	userId: string;
	exerciseName: string;
	count: number;
	countUnit: CountUnit;
	date: Date;
}

export {
	Challenge,
	CountRange,
	Count,
	Exercise,
	Config,
	ScheduleType,
	CompleteChallengeResult,
	Delay,
	TimeUnit,
	Score,
	MessageType,
	ExerciseCount,
	ChallengeEntity,
	AchievementEntity,
};
