import * as Jimp from 'jimp';
import {GREY_INDEX} from './constant';
import {Position} from './types';

const RED_LUMINANCE = 0.2126;
const GREEN_LUMINANCE = 0.7152;
const BLUE_LUMINANCE = 0.0722;

export const RED = [255, 0, 0];
export const GREEN = [0, 255, 0];
export const BLUE = [0, 0, 255];
export const WHITE = [255, 255, 255];
export const BLACK = [0, 0, 0];

export function verifyColor(image: Jimp, idx: number, rgb = WHITE) {
    return image.bitmap.data[idx] === rgb[0] &&
      image.bitmap.data[idx + 1] === rgb[1] &&
      image.bitmap.data[idx + 2] === rgb[2];
}

export function isRed(image: Jimp, idx: number) {
  return verifyColor(image, idx, RED);
}

export function setColor(image: Jimp, idx: number, rgb = [255, 255, 255]) {
    image.bitmap.data[idx] = rgb[0];
    image.bitmap.data[idx + 1] = rgb[1];
    image.bitmap.data[idx + 2] = rgb[2];
}

export function setColorRed(image: Jimp, idx: number) {
  setColor(image, idx, RED);
}

export function setColorWhite(image: Jimp, idx: number) {
  setColor(image, idx, WHITE);
}

export function setColorGreen(image: Jimp, idx: number) {
    setColor(image, idx, GREEN);
}

export function setColorBlue(image: Jimp, idx: number) {
    setColor(image, idx, BLUE);
}

export function setColorBlack(image: Jimp, idx: number) {
    setColor(image, idx, BLACK);
}


export function setBinary(image: Jimp) {
    image.scan(0, 0, image.bitmap.width, image.bitmap.height, (x: number, y: number, idx: number) => {
      const rgb = getRGB(image, idx);
      if (passForegroudTest(rgb.red, rgb.green, rgb.blue, 0)) {
        setColorWhite(image, idx);
      } else {
        setColorBlack(image, idx);
      }
    });
  }

export function getRGB(image: Jimp, idx: number) {
  return {
      red: image.bitmap.data[idx],
      green: image.bitmap.data[idx + 1],
      blue: image.bitmap.data[idx + 2],
  }
}

export function passForegroudTest(red: number, green: number, blue: number, treshhold = 0.3) {
  return ((RED_LUMINANCE * red) + (GREEN_LUMINANCE * green) + (BLUE_LUMINANCE * blue)) > (treshhold * 255);
}

function highlight(image: Jimp, x: number, y: number, width: number, height: number, highlightForeground = true, rgb = RED, greyIndex=GREY_INDEX) {
    image.scan(x, y, width, height, (x, y, idx) => {
      const pixelRGB = getRGB(image, idx);
      if ((highlightForeground && passForegroudTest(pixelRGB.red, pixelRGB.green, pixelRGB.blue)) || !highlightForeground) {
       setColor(image, idx, rgb);
     }
    });
  }

export function getHighlightRangeSelection(image: Jimp) {
    let selections: Position[] = [];
    for (let x = 0; x < image.bitmap.width; x++) {
      let position = {} as Position;
      image.scan(x, 0, 1, image.bitmap.height, (x: number, y: number, idx: number) => {
        if (isRed(image, idx)) {
          if (!position.start) {
            position.position = x;
            position.start = y;
          } else  {
            position.end = y;
          }
        } else if (position.end && position.end - position.start >= 2) {
          selections.push(position);
          position = {} as Position;
        } else {
          // Selection is less than 3 pixels;
          position = {} as Position;
        }
      });
    }
    return selections;
  }

  function darkenWhitePixels(image: Jimp, greyIndex=GREY_INDEX) {
    image.scan(0, 0, image.bitmap.width, image.bitmap.height, (x, y, idx) => {
      const red = image.bitmap.data[idx];
      const green = image.bitmap.data[idx+1];
      const blue = image.bitmap.data[idx+2];
      if (red > greyIndex && green > greyIndex && blue > greyIndex) {
        setColorBlack(image, idx);
      }
    });
  }