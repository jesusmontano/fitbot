"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scheduleChallenge = exports.generateChallenge = void 0;
const config_1 = require("./config");
const random_1 = __importDefault(require("random"));
const eta_1 = require("eta");
const types_1 = require("../types");
const slack_1 = require("./slack");
const array_shuffle_1 = __importDefault(require("array-shuffle"));
const database_1 = require("./database");
const logger_1 = require("../util/logger");
const log = logger_1.getLoggerByFilename(__filename);
const getCount = (countRange) => {
    const number = random_1.default.int(countRange.min, countRange.max);
    return {
        number,
        unit: countRange.unit,
    };
};
const getMessage = (messageTemplate, count) => {
    return eta_1.render(messageTemplate, count);
};
const getRandomExercise = async () => {
    const config = await config_1.getConfig();
    const exerciseId = random_1.default.int(0, config.exercises.length - 1);
    return config.exercises[exerciseId];
};
const getRandomUsers = async () => {
    const users = await slack_1.getUsers();
    const shuffledUsers = array_shuffle_1.default(users);
    const config = await config_1.getConfig();
    const minGroupSize = config.minimumExerciseUserGroupSize > users.length ? users.length : config.minimumExerciseUserGroupSize;
    const exerciseUserGroupSize = random_1.default.int(minGroupSize, users.length);
    return shuffledUsers.slice(0, exerciseUserGroupSize);
};
const generateChallenge = async () => {
    const exercise = await getRandomExercise();
    const users = await getRandomUsers();
    const { name, messageTemplate, countRange } = exercise;
    const count = getCount(countRange);
    const message = getMessage(messageTemplate, count);
    return {
        name,
        message,
        count,
        users,
    };
};
exports.generateChallenge = generateChallenge;
const getValueInMs = (value, unit) => {
    switch (unit) {
        case types_1.TimeUnit.Seconds:
            return value * 1000;
        case types_1.TimeUnit.Minutes:
            return value * 1000 * 60;
        case types_1.TimeUnit.Hours:
            return value * 1000 * 60 * 60;
        default:
            log.info(`Unexpected time unit.`);
            process.exit(1);
    }
};
const getNextExerciseDelaySeconds = async (scheduleType) => {
    if (scheduleType === types_1.ScheduleType.Immediate) {
        return {
            value: 0,
            unit: types_1.TimeUnit.Seconds,
            valueInMs: 0,
        };
    }
    const config = await config_1.getConfig();
    const value = random_1.default.int(config.nextExerciseDelay.min, config.nextExerciseDelay.max);
    const unit = config.nextExerciseDelay.unit;
    const valueInMs = getValueInMs(value, unit);
    return { value, unit, valueInMs };
};
let scheduledChallengeTimer = null;
const scheduleChallenge = async (scheduleType) => {
    const delay = await getNextExerciseDelaySeconds(scheduleType);
    if (delay.value > 0) {
        log.info(`Scheduling challenge in ${delay.value} ${delay.unit}(s)`);
    }
    if (scheduledChallengeTimer !== null) {
        clearTimeout(scheduledChallengeTimer);
    }
    scheduledChallengeTimer = setTimeout(async () => {
        const challenge = await exports.generateChallenge();
        log.info('Sending challenge', challenge);
        database_1.storeChallenge(challenge);
        await slack_1.sendChallengeMessage(challenge);
        scheduleChallenge(types_1.ScheduleType.Random);
    }, delay.valueInMs);
};
exports.scheduleChallenge = scheduleChallenge;
//# sourceMappingURL=challenge.js.map