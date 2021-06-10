const up = async (knex) => {
	await knex.raw(`
		CREATE TABLE Achievements
		(
			id TEXT NOT NULL,
			user_id TEXT NOT NULL,
			exercise_name TEXT NOT NULL,
			count INTEGER NOT NULL,
			count_unit TEXT NOT NULL,
			date TEXT NOT NULL,
			PRIMARY KEY (id)
		);
	`);
	await knex.raw(`
		CREATE TABLE Challenge
		(
			id TEXT NOT NULL,
			exercise_name TEXT NOT NULL,
			count INTEGER NOT NULL,
			count_unit TEXT NOT NULL,
			date TEXT NOT NULL,
			PRIMARY KEY (id)
		);
	`);
};

const down = async (knex) => {
	await knex.raw(`
		DROP TABLE Challenges;
	`);
	await knex.raw(`
		DROP TABLE Achievements;
	`);
};

export { up, down };
