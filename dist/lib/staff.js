"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var Jimp = require("jimp");
var constant_1 = require("./constant");
var utils_1 = require("./utils");
var color = require("./color");
var constant_2 = require("./constant");
var image_1 = require("./image");
var note_1 = require("./note");
var fs_1 = require("fs");
function getHorizontalClassications(image, positions) {
    var classifications = positions.reduce(function (res, curr) {
        if (res.length > 0 && res[res.length - 1].end + 1 == curr) {
            res[res.length - 1].end = curr;
        }
        else {
            res.push({ start: curr, end: curr, classfication: constant_2.Classification.NOISE });
        }
        return res;
    }, []);
    var staffSpaceSize = getStaffSpaceSize(image);
    classifications = classifications.map(function (x) { return Object.assign(x, { classfication: utils_1.getSpaceClassication(x.start, x.end, staffSpaceSize)
    }); });
    return classifications;
}
exports.getHorizontalClassications = getHorizontalClassications;
function getStaffSpaceSize(image, staffLines, staffPadding) {
    if (staffLines === void 0) { staffLines = constant_1.STAFF_LINE_COUNT; }
    if (staffPadding === void 0) { staffPadding = constant_1.STAFF_PADDING; }
    var height = image.bitmap.height / (1 + (2 * staffPadding));
    return height / (staffLines - 1);
    // return (image.bitmap.height - (2 * staffPadding)) / (staffLines - 1);
}
exports.getStaffSpaceSize = getStaffSpaceSize;
function removeLine(image, line) {
    image.scan(0, line, image.bitmap.width, 1, function (x, y, idx) {
        color.setColorBlack(image, idx);
    });
}
exports.removeLine = removeLine;
function fillLineGap(image, line) {
    image.scan(0, line, image.bitmap.width, 1, function (x, y, idx) {
        var fill = false;
        var topPixel = image.bitmap.data[image.getPixelIndex(x, y - 1)];
        if (topPixel > constant_2.GREY_INDEX) {
            fill = true;
        }
        if (fill) {
            color.setColorWhite(image, idx);
        }
    });
}
exports.fillLineGap = fillLineGap;
function getStaffLines(image) {
    var interval = 1;
    var heights = [];
    var staffLines = [];
    for (var height = 0; height < image.bitmap.height; height += interval) {
        heights.push(height);
        var distribution = utils_1.getBinaryDistribution(image, 0, height, image.bitmap.width, 1);
        if (distribution.foreground > 0.75) {
            staffLines.push(height);
        }
    }
    return staffLines;
}
exports.getStaffLines = getStaffLines;
function getStaffBoundaries(staffLines) {
    return staffLines.reduce(function (res, curr) {
        if (res.length === 0) {
            // First line for the staff
            res.push({ start: curr, end: curr });
        }
        else if (curr > (res[res.length - 1].end + 20)) {
            // End too far new staff
            res.push({ start: curr, end: curr });
        }
        else {
            // Update staff end.
            res[res.length - 1].end = curr;
        }
        return res;
    }, []);
}
exports.getStaffBoundaries = getStaffBoundaries;
function findStaffs(image) {
    var staffLines = getStaffLines(image);
    var staffBoundaries = getStaffBoundaries(staffLines);
    saveStaffs(image, staffBoundaries);
}
exports.findStaffs = findStaffs;
/**
 * Saves the images for each staff found in the piece.
 */
function saveStaffs(image, staffBoundaries) {
    for (var _i = 0, staffBoundaries_1 = staffBoundaries; _i < staffBoundaries_1.length; _i++) {
        var boundary = staffBoundaries_1[_i];
        var boundaryOffset = (boundary.end - boundary.start) * constant_1.STAFF_PADDING; // Pixels to go up and down staff;
        image_1.saveClone(image, constant_1.TEMP_IMAGE_PATH + "/staff/" + boundary.start + ".jpg", 0, boundary.start - boundaryOffset, image.bitmap.width, boundary.end - boundary.start + (boundaryOffset * 2));
    }
}
exports.saveStaffs = saveStaffs;
function removeStaffLines(image, lines) {
    for (var _i = 0, lines_1 = lines; _i < lines_1.length; _i++) {
        var line = lines_1[_i];
        removeLine(image, line);
        fillLineGap(image, line);
    }
}
exports.removeStaffLines = removeStaffLines;
function highlightNotes(image, squarePercentage) {
    if (squarePercentage === void 0) { squarePercentage = 15; }
    var squareSize = getStaffSpaceSize(image) * squarePercentage / 100;
    for (var _i = 0, _a = image_1.getAllPixels(image, 0); _i < _a.length; _i++) {
        var pixel = _a[_i];
        var distribution = utils_1.getBinaryDistribution(image, pixel.x, pixel.y, squareSize, squareSize);
        if (distribution.foreground > constant_1.NOTE_AREA_PERCENTAGE / 100) {
            color.highlight(image, pixel.x, pixel.y, squareSize, squareSize);
        }
    }
}
exports.highlightNotes = highlightNotes;
function highlightStaffLines(image, lines) {
    for (var _i = 0, lines_2 = lines; _i < lines_2.length; _i++) {
        var line = lines_2[_i];
        image.scan(0, line, image.bitmap.width, 1, function (x, y, idx) {
            if (!color.verifyColor(image, idx, color.RED)) {
                color.setColorBlue(image, idx);
            }
        });
    }
}
exports.highlightStaffLines = highlightStaffLines;
function highlightNoteVerticalLines(image) {
    var offsetHeight = getStaffSpaceSize(image) * 3;
    var lines = new Set();
    for (var x = 0; x < image.bitmap.width; x++) {
        for (var y = 0; y < image.bitmap.height - offsetHeight; y++) {
            if (utils_1.getBinaryDistribution(image, x, y, 1, offsetHeight).foreground === 1) {
                lines.add(x);
                image.scan(x, y, 1, offsetHeight, function (_, newY, idx) {
                    color.setColorYellow(image, idx);
                });
            }
        }
    }
    // Make sure the yellow lines divides all notes and beams
    lines.forEach(function (x) {
        color.replace(image, color.RED, color.BLACK, x, 0, 1, image.bitmap.height);
    });
}
exports.highlightNoteVerticalLines = highlightNoteVerticalLines;
function getSelectionInfo(image, rgb) {
    // Sweep staff from start to end to get selection
    var selections = color.getHighlightRangeSelection(image, rgb);
    var positions = selections.map(function (x) { return x.position; }).sort(function (a, b) { return a - b; });
    var classifications = getHorizontalClassications(image, positions).filter(function (x) { return x.classfication !== constant_2.Classification.NOISE; });
    var selectionMap = selections.reduce(function (res, curr) {
        if (!res[curr.position]) {
            res[curr.position] = [curr];
        }
        else {
            res[curr.position].push(curr);
        }
        return res;
    }, {});
    fs_1.writeFileSync('_selection.json', JSON.stringify(selections, null, 2), 'utf8');
    fs_1.writeFileSync('_selection_map.json', JSON.stringify(selectionMap, null, 2), 'utf8');
    return { selectionMap: selectionMap, selections: selections, classifications: classifications };
}
exports.getSelectionInfo = getSelectionInfo;
function highlightClef(image) {
    var info = getSelectionInfo(image, color.RED);
    var beamIndex = info.classifications.findIndex(function (x) { return x.classfication === constant_2.Classification.BEAM; });
    if (beamIndex === -1) {
        return;
    }
    var end = info.classifications[beamIndex].end;
    if (beamIndex < info.classifications.length && info.classifications[beamIndex + 1].classfication === constant_2.Classification.DOT) {
        end = info.classifications[beamIndex + 1].end;
    }
    var offset = getStaffSpaceSize(image) * 0.15;
    color.replace(image, color.RED, color.PURPLE, 0, 0, end + offset, image.bitmap.height);
}
exports.highlightClef = highlightClef;
function highlightBeam(image, treshhold) {
    if (treshhold === void 0) { treshhold = 2.5; }
    var info = getSelectionInfo(image, color.RED);
    var offset = getStaffSpaceSize(image) * treshhold;
    var classifications = info.classifications.filter(function (x) { return x.classfication === constant_2.Classification.BEAM; });
    var boundaries = utils_1.getBoundaries(classifications, info.selectionMap);
    var beams = Object.values(boundaries).filter(function (x) { return x.width > offset; });
    for (var _i = 0, beams_1 = beams; _i < beams_1.length; _i++) {
        var boundary = beams_1[_i];
        color.replace(image, color.RED, color.BROWN, boundary.x, boundary.y, boundary.width, boundary.height);
    }
}
exports.highlightBeam = highlightBeam;
function highlightTime(image) {
    var info = getSelectionInfo(image, color.RED);
    var previousClassification;
    for (var _i = 0, _a = info.classifications; _i < _a.length; _i++) {
        var classfication = _a[_i];
        if (classfication.classfication === constant_2.Classification.NOTE) {
            if (previousClassification && previousClassification.classfication === constant_2.Classification.BEAM) {
                color.replace(image, color.RED, color.TEAL, previousClassification.start, 0, classfication.start - previousClassification.start, image.bitmap.height);
            }
            break;
        }
        previousClassification = classfication;
    }
}
exports.highlightTime = highlightTime;
function highlightKeySignature(image) {
    var info = getSelectionInfo(image, color.RED);
    var notes = info.classifications.filter(function (x) { return x.classfication === constant_2.Classification.NOTE; });
    if (notes) {
        color.replace(image, color.RED, color.GREEN, 0, 0, notes[0].start, image.bitmap.height);
    }
}
exports.highlightKeySignature = highlightKeySignature;
function analyzeStaff(path) {
    Jimp.read(path).then(function (image) {
        var lines = getStaffLines(image);
        removeStaffLines(image, lines);
        highlightNotes(image);
        highlightStaffLines(image, lines);
        highlightNoteVerticalLines(image);
        highlightClef(image);
        highlightBeam(image);
        highlightTime(image);
        highlightKeySignature(image);
        color.replace(image, color.WHITE, color.RED, 0, 0, image.bitmap.width, image.bitmap.height);
        var info = getSelectionInfo(image, color.RED);
        var notes = [];
        for (var _i = 0, _a = info.classifications; _i < _a.length; _i++) {
            var classfication = _a[_i];
            if (classfication.classfication === constant_2.Classification.NOTE) {
                console.log(classfication);
                var horizontalRanges = info.selectionMap[classfication.start];
                var stack = 1;
                for (var _b = 0, horizontalRanges_1 = horizontalRanges; _b < horizontalRanges_1.length; _b++) {
                    var range = horizontalRanges_1[_b];
                    var noteInfo = {};
                    if (stack === 1) {
                        noteInfo.top = true;
                    }
                    else if (stack === horizontalRanges.length) {
                        noteInfo.bottom = true;
                    }
                    else {
                        noteInfo.middle = true;
                    }
                    var boundary = note_1.getNoteBoundary(classfication, range, info.selectionMap, noteInfo);
                    var new_image = image.clone();
                    new_image.crop(boundary.x, boundary.y, boundary.width, boundary.height);
                    new_image.write("images/notes/" + boundary.x + "-" + boundary.y + ".jpg");
                    var circleInfo = note_1.getNotCirleInfo(new_image);
                    noteInfo.filled = circleInfo === constant_1.NoteLabel.FILLED;
                    noteInfo.whole = circleInfo === constant_1.NoteLabel.WHOLE;
                    stack++;
                    notes.push(__assign({}, noteInfo, { x: boundary.x }));
                }
            }
        }
        // console.log(notes);
        // console.log(info.selectionMap['241']);
        // console.log(info.selectionMap['242']);
        fs_1.writeFileSync('_debug.json', JSON.stringify(info, null, 2), 'utf8');
        image.write('staff.jpg');
        console.log('DONE');
        return true;
    }).catch(function (err) {
        console.error(err);
    });
}
exports.analyzeStaff = analyzeStaff;
