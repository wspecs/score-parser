import * as Jimp from 'jimp';
import {Range, Boundary, Position, PositionMap, ClassficationType, ClassificationPositionMap} from './types';
import {STAFF_LINE_COUNT, STAFF_PADDING, TEMP_IMAGE_PATH, NOTE_AREA_PERCENTAGE, NoteLabel} from './constant';
import {getSpaceClassication, getBinaryDistribution, getBoundaries} from './utils';
import * as color from './color';
import {GREY_INDEX, Classification} from './constant';
import {saveClone, getAllPixels} from './image';
import {NoteInfo, getNoteBoundary, getNotCirleInfo} from './note';
import {writeFileSync} from 'fs';

export function getHorizontalClassications(image: Jimp, positions: number[]) {
    let classifications = positions.reduce((res: ClassficationType[], curr: number) => {
      if (res.length > 0 && res[res.length - 1].end + 1 == curr) {
        res[res.length - 1].end = curr;
      } else {
        res.push({start: curr, end: curr, classfication: Classification.NOISE});
      }
      return res;
    }, []);
    const staffSpaceSize = getStaffSpaceSize(image);
    classifications = classifications.map(x => Object.assign(x, {classfication: getSpaceClassication(
      x.start, x.end, staffSpaceSize)
    }))
    return classifications;
  }
  
  export function getStaffSpaceSize(image: Jimp, staffLines = STAFF_LINE_COUNT, staffPadding = STAFF_PADDING) {
    const height = image.bitmap.height / (1 + (2 * staffPadding));
    return height / (staffLines - 1);
    // return (image.bitmap.height - (2 * staffPadding)) / (staffLines - 1);
  }

  export function removeLine(image: Jimp, line: number) {
    image.scan(0, line, image.bitmap.width, 1, (x: number, y: number, idx: number) => {
      color.setColorBlack(image, idx);
    });
  }
  
  export function fillLineGap(image: Jimp, line: number) {
    image.scan(0, line, image.bitmap.width, 1, (x: number, y: number, idx: number) => {
      let fill = false;
      const topPixel = image.bitmap.data[image.getPixelIndex(x, y - 1)];
      if (topPixel > GREY_INDEX) {
        fill = true;
      }
      if (fill) {
        color.setColorWhite(image, idx);
      }
    });  
  }

  export function getStaffLines(image: Jimp) {
    const interval = 1;
    const heights = [];
    const staffLines = [];
    
    for (let height = 0; height < image.bitmap.height; height+=interval) {
      heights.push(height);
      const distribution = getBinaryDistribution(image, 0, height, image.bitmap.width, 1);
      if (distribution.foreground > 0.75) {
        staffLines.push(height);
      }
    }
    return staffLines;
  }
  
  export function getStaffBoundaries(staffLines: number[]) {
    return staffLines.reduce((res: Range[], curr) => {
      if (res.length === 0) {
        // First line for the staff
        res.push({start: curr, end: curr});
      } else if (curr > (res[res.length - 1].end + 20)) {
        // End too far new staff
        res.push({start: curr, end: curr});
      } else {
        // Update staff end.
        res[res.length - 1].end = curr;
      }
      return res;
    }, []);
  }
  
  export function findStaffs(image: Jimp) {
    const staffLines = getStaffLines(image);
    const staffBoundaries = getStaffBoundaries(staffLines);
    saveStaffs(image, staffBoundaries);
  }
  
  /**
   * Saves the images for each staff found in the piece.
   */
  export function saveStaffs(image: Jimp, staffBoundaries: Range[]) {
    for (const boundary of staffBoundaries) {
      let boundaryOffset = (boundary.end - boundary.start) * STAFF_PADDING; // Pixels to go up and down staff;
      saveClone(image, `${TEMP_IMAGE_PATH}/staff/${boundary.start}.jpg`, 0, 
      boundary.start - boundaryOffset,
      image.bitmap.width,
      boundary.end - boundary.start + (boundaryOffset * 2));
    }
  }

export function removeStaffLines(image: Jimp, lines: number[]) {
  for (const line of lines) {
    removeLine(image, line);
    fillLineGap(image, line);
  }
}

export function highlightNotes(image: Jimp, squarePercentage = 15) {
  const squareSize = getStaffSpaceSize(image) * squarePercentage / 100;
  for (const pixel of getAllPixels(image, 0)) {
    const distribution = getBinaryDistribution(image, pixel.x, pixel.y, squareSize, squareSize);
    if (distribution.foreground > NOTE_AREA_PERCENTAGE / 100) {
      color.highlight(image, pixel.x, pixel.y, squareSize, squareSize);
    }
  }
}

export function highlightStaffLines(image: Jimp, lines: number[]) {
  for (const line of lines) {
    image.scan(0, line, image.bitmap.width, 1, (x, y, idx) => {
      if (!color.verifyColor(image, idx, color.RED)) {
        color.setColorBlue(image, idx);
      }
    });
  }
}

export function highlightNoteVerticalLines(image: Jimp) {
  const offsetHeight = getStaffSpaceSize(image) * 3;
  const lines = new Set<number>();
  for (let x = 0; x < image.bitmap.width; x++) {
    for (let y = 0; y < image.bitmap.height - offsetHeight; y++) {
      if (getBinaryDistribution(image, x, y, 1, offsetHeight).foreground === 1) {
        lines.add(x);
        image.scan(x, y, 1, offsetHeight, (_, newY, idx) => {
          color.setColorYellow(image, idx);
        });
      }
    }
  }
  // Make sure the yellow lines divides all notes and beams
  lines.forEach(x => {
    color.replace(image, color.RED, color.BLACK, x, 0, 1, image.bitmap.height);
  });
}

export function getSelectionInfo(image: Jimp, rgb: number[]) {
  // Sweep staff from start to end to get selection
  const selections = color.getHighlightRangeSelection(image, rgb);
  
  const positions = selections.map(x => x.position).sort((a, b) => a - b);
  const classifications = getHorizontalClassications(image, positions).filter(
    x => x.classfication !== Classification.NOISE);        
  const selectionMap: ClassificationPositionMap = selections.reduce((res: PositionMap, curr: Position) => {
    if (!res[curr.position]) {
      res[curr.position] = [curr];
    }
    else {
      res[curr.position].push(curr);
    }
    return res;
  }, {});
  writeFileSync('_selection.json', JSON.stringify(selections, null, 2), 'utf8');
  writeFileSync('_selection_map.json', JSON.stringify(selectionMap, null, 2), 'utf8');
  return {selectionMap, selections, classifications};
}

export function highlightClef(image: Jimp) {
  const info = getSelectionInfo(image, color.RED);
  const beamIndex = info.classifications.findIndex(x => x.classfication === Classification.BEAM);
  if (beamIndex === -1) {
    return;
  }
  let end = info.classifications[beamIndex].end;
  if (beamIndex < info.classifications.length && info.classifications[beamIndex + 1].classfication === Classification.DOT) {
    end = info.classifications[beamIndex + 1].end;
  }
  const offset = getStaffSpaceSize(image) * 0.15;
  color.replace(image, color.RED, color.PURPLE, 0, 0, end + offset, image.bitmap.height);
}

export function highlightBeam(image: Jimp, treshhold = 2.5) {
  const info = getSelectionInfo(image, color.RED);
  const offset = getStaffSpaceSize(image) * treshhold;
  const classifications = info.classifications.filter(x => x.classfication === Classification.BEAM);
  const boundaries = getBoundaries(classifications, info.selectionMap);
  const beams = Object.values(boundaries).filter((x: Boundary) => x.width >  offset);
  for (const boundary of beams) {
    color.replace(image, color.RED, color.BROWN, boundary.x, boundary.y, boundary.width, boundary.height);
  }
}

export function highlightTime(image: Jimp) {
  const info = getSelectionInfo(image, color.RED);
  let previousClassification;
  for (const classfication of info.classifications) {
    if (classfication.classfication === Classification.NOTE) {
      if (previousClassification && previousClassification.classfication === Classification.BEAM) {
        color.replace(image, color.RED, color.TEAL, previousClassification.start, 0,
          classfication.start - previousClassification.start, image.bitmap.height);
      }
      break;
    }
    previousClassification = classfication;
  }
}

export function highlightKeySignature(image: Jimp) {
  const info = getSelectionInfo(image, color.RED);
  const notes = info.classifications.filter(x => x.classfication === Classification.NOTE);
  if (notes) {
    color.replace(image, color.RED, color.GREEN, 0, 0,
      notes[0].start, image.bitmap.height);
  }
}

export function analyzeStaff(path: string) {
    Jimp.read(path).then(image => {
      const lines = getStaffLines(image)
      removeStaffLines(image, lines);
      highlightNotes(image);
      highlightStaffLines(image, lines);
      highlightNoteVerticalLines(image);
      highlightClef(image);
      highlightBeam(image);
      highlightTime(image);
      highlightKeySignature(image);
      color.replace(image, color.WHITE, color.RED, 0, 0, image.bitmap.width, image.bitmap.height);
      

  
    const info = getSelectionInfo(image, color.RED);
    const notes = [];
    for (const classfication of info.classifications) {
      if (classfication.classfication === Classification. NOTE) {
        console.log(classfication);
        const horizontalRanges = info.selectionMap[classfication.start];
        let stack = 1;
        for (const range of horizontalRanges) {
          const noteInfo = {} as NoteInfo;
          if (stack === 1) {
            noteInfo.top = true;
          }
          else if (stack === horizontalRanges.length) {
            noteInfo.bottom = true;
          }
          else {
            noteInfo.middle = true;
          }
          const boundary = getNoteBoundary(classfication, range, info.selectionMap, noteInfo);
          const new_image = image.clone();
          new_image.crop(boundary.x, boundary.y, boundary.width, boundary.height);
          new_image.write(`images/notes/${boundary.x}-${boundary.y}.jpg`);
          const circleInfo = getNotCirleInfo(new_image);
          noteInfo.filled = circleInfo === NoteLabel.FILLED;
          noteInfo.whole = circleInfo === NoteLabel.WHOLE;
          stack++;
          notes.push({...noteInfo, x: boundary.x});
        }
      }
    }
    // console.log(notes);
    // console.log(info.selectionMap['241']);
    // console.log(info.selectionMap['242']);

    writeFileSync('_debug.json', JSON.stringify(info, null, 2), 'utf8');

      image.write('staff.jpg');
      console.log('DONE');
      return true;
    }).catch(function (err) {
      console.error(err);
    });
  }