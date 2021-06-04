import DB from 'better-sqlite3-helper';
import { Challenge, CompleteChallengeResult } from '../types';
import { getLoggerByFilename } from '../util/logger';
import { Logger } from 'log4js';
import { v4 as uuidv4 } from 'uuid';

const log: Logger = getLoggerByFilename(__filename);

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
	DB().replace('Challenge', {
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
	DB().insert('Achievements', {
		id: uuidv4(),
		user_id: userId,
		exercise_name: challenge.exercise_name,
		count_number: challenge.count_number,
		count_unit: challenge.count_unit,
		date: challenge.date,
	});
	log.info(DB().queryFirstRow('SELECT * FROM Achievements'));
	// console.log(`Top Scores...`);
	// console.log(getTopScores());
	// console.log(`User Score...`);
	// console.log(getUserScore(userId));
	return CompleteChallengeResult.Completed;
};

const getTopScores = () => {
	return DB().query(
		'SELECT user_id, COUNT(*) as achievement_count FROM Achievements GROUP BY user_id ORDER BY achievement_count DESC LIMIT 3',
	);
};

const getUserScore = (userId: string) => {
	return DB().query('SELECT COUNT(*) as achievement_count FROM achievements WHERE user_id=?', userId);
};

export { storeChallenge, completeChallenge, getTopScores, getUserScore };
