import { v4 as uuidv4 } from 'uuid';

import { AchievementEntity, Challenge, ChallengeEntity, CompleteChallengeResult } from '../types';
import { knex } from '../services/database';

const storeChallenge = async (challenge: Challenge) => {
	const trx = await knex.transaction();
	try {
		await trx('Challenge').delete();
		await trx('Challenge').insert({
			id: uuidv4(),
			exerciseName: challenge.name,
			count: challenge.count.number,
			countUnit: challenge.count.unit,
			date: new Date().toISOString(),
		});
		await trx.commit();
	} catch {
		trx.rollback();
	}
};

const completeChallenge = async (userId: string): Promise<CompleteChallengeResult> => {
	const challenge: ChallengeEntity = await knex('Challenge').select('*').first();
	if (challenge === undefined) {
		return CompleteChallengeResult.NotFound;
	}
	const achievement: AchievementEntity = await knex('Achievements')
		.select('*')
		.where({ userId, id: challenge.id })
		.first();
	if (achievement !== undefined) {
		return CompleteChallengeResult.AlreadyCompleted;
	}
	await knex('Achievements').insert({
		id: challenge.id,
		userId: userId,
		exerciseName: challenge.exerciseName,
		count: challenge.count,
		countUnit: challenge.countUnit,
		date: challenge.date,
	});
	return CompleteChallengeResult.Completed;
};

export { storeChallenge, completeChallenge };
