import knex, { Knex } from 'knex';

// @ts-ignore
import knexStringcase from 'knex-stringcase';

import knexConfigs from '../../knexfile';

interface KnexConfig {
	[key: string]: any;
}

const environment = process.env.NODE_ENV || 'local-sqlite';
const knexConfig: KnexConfig = (<KnexConfig>knexConfigs)[environment];
const knexInstance: Knex = knex(knexStringcase(knexConfig));

export { knexInstance as knex };
