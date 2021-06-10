const getDirname = () => {
	const pathname = new URL(import.meta.url).pathname;
	const dirname = pathname.substring(0, pathname.lastIndexOf('/'));
	return dirname;
};
const getMigrations = (db) => ({
	directory: getDirname() + `/knex/migrations/${db}`,
});
const getSeeds = (db) => ({
	directory: getDirname() + `/knex/migrations/${db}`,
});
const configs = {
	'local-sqlite': {
		client: 'sqlite',
		connection: {
			filename: './sqlite.db',
		},
		migrations: getMigrations('sqlite'),
		seeds: getSeeds('sqlite'),
	},
	'local-postgres': {
		client: 'postgresql',
		connection: {
			database: 'fitbot',
			host: '127.0.0.1',
			password: 'password',
			user: 'fitbot',
		},
		migrations: getMigrations('postgres'),
		seeds: getSeeds('postgres'),
	},
	production: {
		client: 'postgresql',
		connection: process.env.DATABASE_URL,
		pool: {
			min: 2,
			max: 10,
		},
		migrations: getMigrations('postgres'),
		seeds: getSeeds('postgres'),
	},
};

export default configs;
