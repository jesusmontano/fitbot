import { v4 as uuidv4 } from 'uuid';
import { millisecondsToMinutes } from 'date-fns';

import {
	AchievementEntity,
	Challenge,
	ChallengeEntity,
	ChallengeStatus,
	CompleteChallengeResult,
	SlackAPIRate,
} from '../types';
import { knex } from '../util/database';

const getSlackAPIRate = async (): Promise<SlackAPIRate> => {
	const challenge: ChallengeEntity = await knex('Challenge').select('*').first();
	if (challenge === undefined) {
		return SlackAPIRate.NotThrottled;
	}
	if (challenge.status === ChallengeStatus.GettingUserPresence) {
		return SlackAPIRate.Throttled;
	}
	const millisNow = new Date().valueOf();
	const millisChallenge: number = challenge.date.valueOf();
	const millisSinceChallenge: number = millisNow - millisChallenge;
	const minutesSinceChallenge = millisecondsToMinutes(millisSinceChallenge);
	if (minutesSinceChallenge > 0) {
		return SlackAPIRate.NotThrottled;
	}
	return SlackAPIRate.Throttled;
};

const getChallengeStatus = async (): Promise<ChallengeStatus> => {
	const challengeEntity: ChallengeEntity = await knex('Challenge').select('*').first();
	return challengeEntity === undefined ? ChallengeStatus.NotFound : challengeEntity.status;
};

const storeChallenge = async (challenge: Challenge) => {
	const trx = await knex.transaction();
	try {
		await trx('Challenge').delete();
		await trx('Challenge').insert({
			id: uuidv4(),
			exerciseName: challenge.name,
			count: challenge.count.number,
			countUnit: challenge.count.unit,
			date: new Date(),
			status: challenge.status,
		});
		await trx.commit();
	} catch {
		trx.rollback();
	}
};

const updateChallengeStatus = async (status: ChallengeStatus) => {
	const challengeEntity: ChallengeEntity = await knex('Challenge').select('*').first();
	if (challengeEntity !== undefined) {
		await knex('Challenge').update({
			...challengeEntity,
			date: new Date(),
			status,
		});
	}
};

const completeChallenge = async (userId: string): Promise<CompleteChallengeResult> => {
	const challengeEntity: ChallengeEntity = await knex('Challenge').select('*').first();
	if (challengeEntity === undefined) {
		return CompleteChallengeResult.NotFound;
	}
	const achievementEntity: AchievementEntity = await knex('Achievements')
		.select('*')
		.where({ userId, id: challengeEntity.id })
		.first();
	if (achievementEntity !== undefined) {
		return CompleteChallengeResult.AlreadyCompleted;
	}
	await knex('Achievements').insert({
		id: challengeEntity.id,
		userId: userId,
		exerciseName: challengeEntity.exerciseName,
		count: challengeEntity.count,
		countUnit: challengeEntity.countUnit,
		date: challengeEntity.date,
	});
	return CompleteChallengeResult.Completed;
};

export { completeChallenge, getChallengeStatus, getSlackAPIRate, storeChallenge, updateChallengeStatus };
