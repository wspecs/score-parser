import * as Jimp from 'jimp';
import {cropLeft, cropRight} from './image';
import {setBinary, setColorRed} from './color';
import {findStaffs} from './staff';

export function analyzeScore(path: string) {
    Jimp.read(path).then((image: Jimp) => {
        image.greyscale();
        image.contrast(1);
        image.invert();
        setBinary(image);
        cropLeft(image);
        cropRight(image);
        findStaffs(image);
        image.write('score.jpg');
        return true;
    }).catch(err => console.log(err));
}