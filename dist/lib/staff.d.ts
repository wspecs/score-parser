import * as Jimp from 'jimp';
import { Range } from './types';
export declare function getHorizontalClassications(image: Jimp, positions: number[]): Range[];
export declare function getStaffSpaceSize(image: Jimp, staffLines?: number, staffPadding?: number): number;
export declare function removeLine(image: Jimp, line: number): void;
export declare function fillLineGap(image: Jimp, line: number): void;
export declare function getStaffLines(image: Jimp): number[];
export declare function getStaffBoundaries(staffLines: number[]): Range[];
export declare function findStaffs(image: Jimp): void;
/**
 * Saves the images for each staff found in the piece.
 */
export declare function saveStaffs(image: Jimp, staffBoundaries: Range[]): void;
