"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GREY_INDEX = 16;
exports.STAFF_PADDING = 0.75; // In staff height
exports.STAFF_LINE_COUNT = 5;
exports.NOTE_WIDTH = 10;
exports.NOTE_AREA_PERCENTAGE = 70;
exports.TEMP_IMAGE_PATH = 'images/tmp';
var Classification;
(function (Classification) {
    Classification["NOISE"] = "noise";
    Classification["NOTE"] = "note";
    Classification["DOT"] = "dot";
    Classification["BEAM"] = "beam";
    Classification["VARIATION"] = "variation";
})(Classification = exports.Classification || (exports.Classification = {}));
var NoteLabel;
(function (NoteLabel) {
    NoteLabel["FILLED"] = "filled";
    NoteLabel["WHOLE"] = "whole";
})(NoteLabel = exports.NoteLabel || (exports.NoteLabel = {}));
