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
	date: Date;
	status: ChallengeStatus;
}

enum ScheduleType {
	Immediate,
	SixtySecondDelay,
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

enum SlackAPIRate {
	Throttled,
	NotThrottled,
}

enum ChallengeStatus {
	GettingUserPresence = 'GettingUserPresence',
	Started = 'Started',
	Cancelled = 'Cancelled',
	NotFound = 'NotFound',
}

interface ChallengeEntity {
	id: string;
	exerciseName: string;
	count: number;
	countUnit: CountUnit;
	date: Date;
	status: ChallengeStatus;
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
	SlackAPIRate,
	ChallengeStatus,
};
