import * as Jimp from 'jimp';
import { Range, Position, ClassficationType, ClassificationPositionMap } from './types';
export declare function getHorizontalClassications(image: Jimp, positions: number[]): ClassficationType[];
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
export declare function removeStaffLines(image: Jimp, lines: number[]): void;
export declare function highlightNotes(image: Jimp, squarePercentage?: number): void;
export declare function highlightStaffLines(image: Jimp, lines: number[]): void;
export declare function highlightNoteVerticalLines(image: Jimp): void;
export declare function getSelectionInfo(image: Jimp, rgb: number[]): {
    selectionMap: ClassificationPositionMap;
    selections: Position[];
    classifications: ClassficationType[];
};
export declare function highlightClef(image: Jimp): void;
export declare function highlightBeam(image: Jimp, treshhold?: number): void;
export declare function highlightTime(image: Jimp): void;
export declare function highlightKeySignature(image: Jimp): void;
export declare function analyzeStaff(path: string): void;
