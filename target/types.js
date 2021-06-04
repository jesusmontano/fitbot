"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimeUnit = exports.CompleteChallengeResult = exports.ScheduleType = void 0;
var CountUnit;
(function (CountUnit) {
    CountUnit[CountUnit["Reps"] = 0] = "Reps";
    CountUnit[CountUnit["Seconds"] = 1] = "Seconds";
})(CountUnit || (CountUnit = {}));
var TimeUnit;
(function (TimeUnit) {
    TimeUnit["Seconds"] = "seconds";
    TimeUnit["Minutes"] = "minutes";
    TimeUnit["Hours"] = "hours";
})(TimeUnit || (TimeUnit = {}));
exports.TimeUnit = TimeUnit;
var ScheduleType;
(function (ScheduleType) {
    ScheduleType[ScheduleType["Immediate"] = 0] = "Immediate";
    ScheduleType[ScheduleType["Random"] = 1] = "Random";
})(ScheduleType || (ScheduleType = {}));
exports.ScheduleType = ScheduleType;
var CompleteChallengeResult;
(function (CompleteChallengeResult) {
    CompleteChallengeResult[CompleteChallengeResult["Completed"] = 0] = "Completed";
    CompleteChallengeResult[CompleteChallengeResult["NotFound"] = 1] = "NotFound";
})(CompleteChallengeResult || (CompleteChallengeResult = {}));
exports.CompleteChallengeResult = CompleteChallengeResult;
//# sourceMappingURL=types.js.map