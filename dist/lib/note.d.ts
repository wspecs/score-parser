import * as Jimp from 'jimp';
import { Range, Position } from './types';
import { NoteLabel } from './constant';
export interface NoteInfo {
    top: boolean;
    middle: boolean;
    bottom: boolean;
    filled: boolean;
    whole: boolean;
}
export declare function getNotCirleInfo(image: Jimp): NoteLabel;
export declare function getNoteBoundary(horizontalRange: Range, verticalRange: Position, selectionMap: {}, noteInfo: NoteInfo, noteCount?: number): {
    x: number;
    y: number;
    height: number;
    width: number;
};
