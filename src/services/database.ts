import DB from 'better-sqlite3-helper';
import { Challenge, CompleteChallengeResult } from '../types';
import { getLoggerByFilename } from '../util/logger';
import { Logger } from 'log4js';

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
	let achievement = DB().queryFirstRow(
		'SELECT * FROM Achievements WHERE user_id=? AND exercise_name=?',
		userId,
		challenge.exercise_name,
	);
	const totalCountNumber =
		achievement === undefined ? challenge.count_number : achievement.total_count_number + challenge.count_number;
	DB().replace('Achievements', {
		user_id: userId,
		exercise_name: challenge.exercise_name,
		total_count_number: totalCountNumber,
		total_count_unit: challenge.count_unit,
		date: challenge,
	});
	log.info(DB().queryFirstRow('SELECT * FROM Achievements'));
	return CompleteChallengeResult.Completed;
};

export { storeChallenge, completeChallenge };
