import { ExerciseCount, Score } from '../types';
import { knex } from '../util/database';

const getTopScores = async (count: number): Promise<Score[]> => {
	return knex('Achievements')
		.select('userId')
		.select(knex.raw('COUNT(*) as achievement_count'))
		.groupBy('userId')
		.orderBy('achievementCount', 'desc')
		.limit(count);
};

const getUserScore = async (userId: string): Promise<Score> => {
	const score: Score = await knex('Achievements')
		.select('userId')
		.select(knex.raw('COUNT(*) as achievement_count'))
		.groupBy('userId')
		.where({ userId })
		.first();

	if (score === undefined) {
		return {
			userId: userId,
			achievementCount: 0,
			exerciseCounts: [],
		};
	}
	const exerciseCounts: ExerciseCount[] = await knex('Achievements')
		.select('exerciseName', 'countUnit')
		.select(knex.raw('SUM(count) as count'))
		.where({ userId })
		.groupBy('exerciseName', 'countUnit');
	return {
		...score,
		exerciseCounts,
	};
};

export { getTopScores, getUserScore };
