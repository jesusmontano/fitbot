"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserScore = exports.getTopScores = exports.completeChallenge = exports.storeChallenge = void 0;
const better_sqlite3_helper_1 = __importDefault(require("better-sqlite3-helper"));
const types_1 = require("../types");
const logger_1 = require("../util/logger");
const uuid_1 = require("uuid");
const log = logger_1.getLoggerByFilename(__filename);
better_sqlite3_helper_1.default({
    path: './data/database.db',
    fileMustExist: false,
    WAL: true,
    migrate: {
        // disable completely by setting `migrate: false`
        force: false,
        table: 'migration',
        migrationsPath: './migrations', // path of the migration-files
    },
});
const storeChallenge = (challenge) => {
    better_sqlite3_helper_1.default().replace('Challenge', {
        exercise_name: challenge.name,
        count_number: challenge.count.number,
        count_unit: challenge.count.unit,
        date: Date.now(),
    });
};
exports.storeChallenge = storeChallenge;
const completeChallenge = (userId) => {
    let challenge = better_sqlite3_helper_1.default().queryFirstRow('SELECT * FROM Challenge');
    if (challenge === undefined) {
        return types_1.CompleteChallengeResult.NotFound;
    }
    better_sqlite3_helper_1.default().insert('Achievements', {
        id: uuid_1.v4(),
        user_id: userId,
        exercise_name: challenge.exercise_name,
        count_number: challenge.count_number,
        count_unit: challenge.count_unit,
        date: challenge.date,
    });
    log.info(better_sqlite3_helper_1.default().queryFirstRow('SELECT * FROM Achievements'));
    // console.log(`Top Scores...`);
    // console.log(getTopScores());
    // console.log(`User Score...`);
    // console.log(getUserScore(userId));
    return types_1.CompleteChallengeResult.Completed;
};
exports.completeChallenge = completeChallenge;
const getTopScores = () => {
    return better_sqlite3_helper_1.default().query('SELECT user_id, COUNT(*) as achievement_count FROM Achievements GROUP BY user_id ORDER BY achievement_count DESC LIMIT 3');
};
exports.getTopScores = getTopScores;
const getUserScore = (userId) => {
    return better_sqlite3_helper_1.default().query('SELECT COUNT(*) as achievement_count FROM achievements WHERE user_id=?', userId);
};
exports.getUserScore = getUserScore;
//# sourceMappingURL=database.js.map