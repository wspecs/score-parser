import * as Jimp from 'jimp';
export declare function getAllPixels(image: Jimp, border?: number): {
    x: number;
    y: number;
}[];
export declare function cropImage(image: Jimp, x: number, y: number, width: number, height: number, treshhold?: number, greyIndex?: number): boolean;
export declare function cropLeft(image: Jimp): void;
export declare function cropRight(image: Jimp): void;
export declare function saveClone(image: Jimp, path: string, x: number, y: number, width: number, height: number): void;
