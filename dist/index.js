"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var score_1 = require("./lib/score");
exports.analyzeScore = score_1.analyzeScore;
var staff_1 = require("./lib/staff");
if (process.argv[2] === 'score' && process.argv[3]) {
    console.log('yes');
    score_1.analyzeScore(process.argv[3]);
}
if (process.argv[2] === 'staff' && process.argv[3]) {
    console.log('yes');
    staff_1.analyzeStaff("images/tmp/staff/" + process.argv[3] + ".jpg");
}
