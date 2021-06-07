import DB from 'better-sqlite3-helper';
import { Challenge, CompleteChallengeResult, Score } from '../types';
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
		count_number: challenge.count.number,
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
		count_number: challenge.count_number,
		count_unit: challenge.count_unit,
		date: challenge.date,
	});
	return CompleteChallengeResult.Completed;
};

const getTopScores = (count: number): Score[] => {
	return DB().query(
		`SELECT user_id, COUNT(*) as achievement_count FROM Achievements GROUP BY user_id ORDER BY achievement_count DESC LIMIT ${count}`,
	);
};

const getUserScore = (userId: string): Score => {
	const achievement: Score | undefined = DB().queryFirstRow(
		'SELECT user_id, COUNT(*) as achievement_count FROM Achievements WHERE user_id=?',
		userId,
	);
	if (achievement === undefined) {
		return {
			user_id: userId,
			achievement_count: 0,
		};
	}
	return achievement;
};

export { storeChallenge, completeChallenge, getTopScores, getUserScore };
