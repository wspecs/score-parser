export interface Range {
    start: number;
    end: number;
}
export interface Position extends Range {
    position: number;
}
export interface PositionMap {
    [key: string]: Position[];
}
