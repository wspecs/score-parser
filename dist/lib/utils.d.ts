import { Classification } from './constant';
import { Range, Position, PositionMap, ClassficationType, ClassificationPositionMap, BoundaryMap } from './types';
import * as Jimp from 'jimp';
export declare function getBinaryDistribution(image: Jimp, x: number, y: number, width: number, height: number, greyIndex?: number): {
    foreground: number;
    background: number;
};
export declare function binaryDistribution(foreground: number, background: number): {
    foreground: number;
    background: number;
};
export declare function getBoudary(horizontalRange: Range, verticalRange: Range, padding?: number): {
    x: number;
    y: number;
    height: number;
    width: number;
};
export declare function getNextPositions(previousPosition: Position, selectionMap: PositionMap): Position[];
export declare function getSpaceClassication(start: number, end: number, staffSpaceSize: number): Classification;
export declare function getSelectionBoundary(horizontalRange: Range, verticalRange: Position, selectionMap: {}): {
    x: number;
    y: number;
    height: number;
    width: number;
};
export declare function getBoundaries(classifications: ClassficationType[], selectionMap: ClassificationPositionMap): BoundaryMap;
