export const GREY_INDEX = 16;
export const STAFF_PADDING = 0.75;  // In staff height
export const STAFF_LINE_COUNT = 5;
export const NOTE_WIDTH = 10;
export const NOTE_AREA_PERCENTAGE = 70;
export const TEMP_IMAGE_PATH = 'images/tmp';

export enum Classification {
    NOISE = 'noise',
    NOTE = 'note',
    DOT = 'dot',
    BEAM = 'beam',
    VARIATION = 'variation',
}

export enum NoteLabel {
    FILLED = 'filled',
    WHOLE = 'whole',
}