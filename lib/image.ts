import * as Jimp from 'jimp';
import {GREY_INDEX} from './constant';
import {getBinaryDistribution} from './utils';

export function getAllPixels(image: Jimp, border = 0) {
    const pixels = [];
    for (let x = border; x < image.bitmap.width - border; x++) {
      for (let y = border; y < image.bitmap.height - border; y++) {
        pixels.push({x, y});
      }
    }
    return pixels;
  }
  
export function cropImage(image: Jimp, x: number, y: number, width: number, height: number, treshhold=0.005, greyIndex=GREY_INDEX) {
    return getBinaryDistribution(image, x, y, width, height, greyIndex).white < treshhold;
  }

export function cropLeft(image: Jimp) {
    let crop = 0;
    for (let width = 5; width < image.bitmap.width; width+=10) {
      if (cropImage(image, 0, 0, width, image.bitmap.height)) {
        crop = width;
      } else {
        break;
      }
    }
    if (crop) {
     image.crop(crop, 0, image.bitmap.width - crop, image.bitmap.height);
    }
  }
  
export function cropRight(image: Jimp) {
    let crop = 0;
    const interval = 5;
    for (let width = interval; width < image.bitmap.width; width+=interval) {
      if (cropImage(image, image.bitmap.width - width, 0, width, image.bitmap.height, 0.01)) {
        crop = width;
      } else {
        break;
      }
    }
    if (crop) {
     image.crop(0, 0, image.bitmap.width - crop, image.bitmap.height);
    }
  }

  export function saveClone(image: Jimp, path: string, x: number, y: number, width: number, height: number) {
    const clone = image.clone();
    clone.crop(x, y, width, height);
    clone.write(path);
  }