import { Classification } from "./constant";

export interface Range {
    start: number;
    end: number;
}

export interface Position extends Range {
  position: number;
}

export interface ClassficationType extends Range {
    classfication: Classification;
  }

export interface PositionMap {
    [key: string]: Position[];
}

export interface ClassificationMap {
    [key: string]: ClassficationType[];
}

export interface ClassificationPositionMap {
    [key: string]: (ClassficationType&Position)[];
}

export interface Boundary {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface BoundaryMap {
    [key: string]: Boundary;
}