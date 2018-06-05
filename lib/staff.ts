import * as Jimp from 'jimp';
import {Range} from './types';
import {STAFF_LINE_COUNT, STAFF_PADDING, TEMP_IMAGE_PATH} from './constant';
import {getSpaceClassication, getBinaryDistribution} from './utils';
import * as color from './color';
import {GREY_INDEX} from './constant';
import {saveClone} from './image';

export function getHorizontalClassications(image: Jimp, positions: number[]) {
    let classifications = positions.reduce((res: Range[], curr: number) => {
      if (res.length > 0 && res[res.length - 1].end + 1 == curr) {
        res[res.length - 1].end = curr;
      } else {
        res.push({start: curr, end: curr});
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
    return (image.bitmap.height - (2 * staffPadding)) / (staffLines - 1);
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
      if (distribution.white > 0.75) {
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
    console.log(staffLines);
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