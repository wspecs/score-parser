var Jimp = require('jimp');

const GREY_INDEX = 16;
const STAFF_PADDING = 30;
const STAFF_LINE_COUNT = 5;
const NOTE_WIDTH = 10;
const NOTE_AREA_PERCENTAGE = 70;

const NOISE = 'noise';
const NOTE = 'note';
const DOT = 'dot';
const BEAM = 'beam';
const VARIATION = 'varation';

const FILLED_NOTE = 'filled-note';
const WHOLE_NOTE = 'hole-note';

if (process.argv[2] === 'staff' && process.argv[3]) {
  analyzeStaff(process.argv[3]);
}
else if (process.argv[2] === 'score' && process.argv[3]) {
  analyzeScore(process.argv[3]);
}

function analyzeStaff(staff) {
  Jimp.read(`heights/staff-${staff}.jpg`).then(function (image) {
    const lines = getStaffLines(image)
    for (const line of lines) {
      removeLine(image, line);
      fillLineGap(image, line);
    }
    const squareSize = getStaffSpaceSize(image) * 0.18;
    for (const pixel of getAllPixels(image, 0)) {
      const distribution = getBinaryDistribution(image, pixel.x, pixel.y, squareSize, squareSize);
      if (distribution.white > NOTE_AREA_PERCENTAGE / 100) {
        highlight(image, pixel.x, pixel.y, squareSize, squareSize);
      }
    }

    for (const line of lines) {
      image.scan(0, line, image.bitmap.width, 1, (x, y, idx) => {
        if (!isRed(image, idx)) {
          image.bitmap.data[idx] = 0;
          image.bitmap.data[idx + 1] = 0;
          image.bitmap.data[idx + 2] = 255;
        }
      });
    }

    const offsetHeight = Number(getStaffSpaceSize(image) * 3);
    for (let x = 0; x < image.bitmap.width; x++) {
      for (let y = 0; y < image.bitmap.height - offsetHeight; y++) {
        if (getBinaryDistribution(image, x, y, 1, offsetHeight).white === 1) {
          image.scan(x, y, 1, offsetHeight, (_, newY, idx) => {
            image.bitmap.data[idx] = 255;
            image.bitmap.data[idx + 1] = 255;
            image.bitmap.data[idx + 2] = 0;
          });
        }
      }
    }
    // return image.write('generated-binary.jpg'); // debug

    // const firstNoteIndex = getPixelForFirstNote(image);
    // // Remove cleff, time signature
    // image.crop(firstNoteIndex, 0, image.bitmap.width - firstNoteIndex, image.bitmap.height);
  
    // Sweep staff from start to end to get selection
    const selections = getHighlightRangeSelection(image);
    // Get unique x position with possible music notation
    const positions = Array.from(new Set(selections.map(x => x.position))).sort((a, b) => a - b);
    const classifications = getHorizontalClassications(image, positions).filter(x => x.classfication !== NOISE);
    const NOTES = {};
    const selectionMap = selections.reduce((res, curr) => {
      if (!res[curr.position]) {
        res[curr.position] = [curr];
      }
      else {
        res[curr.position].push(curr);
      }
      return res;
    }, {});

    for (const classfication of classifications) {
      console.log(classfication);      
      if (classfication.classfication === BEAM) {
        // console.log(classfication);
      }
      // console.log(classfication); continue;
      if (classfication.classfication === NOTE) {
        const horizontalRanges = selectionMap[classfication.start];
        let stack = 1;
        for (const range of horizontalRanges) {
          const noteInfo = {};
          if (stack === 1) {
            noteInfo.top = true;
          }
          else if (stack === horizontalRanges.length) {
            noteInfo.bottom = true;
          }
          else {
            noteInfo.middle = true;
          }
          const boundary = getNoteBoundary(classfication, range, selectionMap, noteInfo);
          new_image = image.clone();
          new_image.crop(boundary.x, boundary.y, boundary.width, boundary.height);
          new_image.write(`notes/${boundary.x}-${boundary.y}.jpg`);
          circleInfo = getNotCirleInfo(new_image);
          noteInfo.filled = circleInfo === FILLED_NOTE;
          noteInfo.whole = circleInfo === WHOLE_NOTE;
          stack++;
        }
      }
    }
    image.write('generated-binary.jpg');
    console.log('DONE');
    return true;
  }).catch(function (err) {
    console.error(err);
  });
}

