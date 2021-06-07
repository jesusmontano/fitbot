import DB from 'better-sqlite3-helper';
import { Challenge, CompleteChallengeResult, ExerciseCount, Score } from '../types';
import { v4 as uuidv4 } from 'uuid';

DB({
	path: './data/database.db',
	fileMustExist: false, // throw error if database not exists
	WAL: true, // automatically enable 'PRAGMA journal_mode = WAL'
	migrate: {
		// disable completely by setting `migrate: false`
		force: false, // set to 'last' to automatically reapply the last migration-file
		table: 'migration', // name of the database table that is used to keep track
		migrationsPath: './migrations', // path of the migration-files
	},
});

const storeChallenge = (challenge: Challenge) => {
	DB().prepare('DELETE from Challenge').run();
	DB().insert('Challenge', {
		id: uuidv4(),
		exercise_name: challenge.name,
		count: challenge.count.number,
		count_unit: challenge.count.unit,
		date: Date.now(),
	});
};

const completeChallenge = (userId: string): CompleteChallengeResult => {
	let challenge = DB().queryFirstRow('SELECT * FROM Challenge');
	if (challenge === undefined) {
		return CompleteChallengeResult.NotFound;
	}
	const achievement = DB().queryFirstRow('SELECT * FROM Achievements WHERE user_id=? AND id=?', userId, challenge.id);
	if (achievement !== undefined) {
		return CompleteChallengeResult.AlreadyCompleted;
	}
	DB().insert('Achievements', {
		id: challenge.id,
		user_id: userId,
		exercise_name: challenge.exercise_name,
		count: challenge.count,
		count_unit: challenge.count_unit,
		date: challenge.date,
	});
	return CompleteChallengeResult.Completed;
};

const getTopScores = (count: number): Score[] => {
	return DB().query(
		`SELECT user_id as userId, COUNT(*) as achievementCount FROM Achievements GROUP BY user_id ORDER BY achievementCount DESC LIMIT ${count}`,
	);
};

const getUserScore = (userId: string): Score => {
	const score: Score | undefined = DB().queryFirstRow(
		'SELECT user_id as userId, COUNT(*) as achievementCount FROM Achievements WHERE user_id=?',
		userId,
	);
	if (score === undefined) {
		return {
			userId: userId,
			achievementCount: 0,
			exerciseCounts: [],
		};
	}
	const exerciseCounts: ExerciseCount[] = DB().query(
		'SELECT exercise_name as exerciseName, SUM(count) as count, count_unit as countUnit FROM Achievements WHERE user_id=? GROUP BY exerciseName',
		userId,
	);
	return {
		...score,
		exerciseCounts,
	};
};

export { storeChallenge, completeChallenge, getTopScores, getUserScore };
