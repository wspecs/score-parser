"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var color = require("../lib/color");
var chai_1 = require("chai");
describe('color', function () {
    it('passes foreground test', function () {
        chai_1.expect(color.passForegroudTest(0, 0, 0, 0.5)).to.equal(false);
        chai_1.expect(color.passForegroudTest(10, 10, 10, 0.5)).to.equal(false);
        chai_1.expect(color.passForegroudTest(200, 255, 155, 0.5)).to.equal(true);
        chai_1.expect(color.passForegroudTest(255, 255, 255, 0.5)).to.equal(true);
    });
});
