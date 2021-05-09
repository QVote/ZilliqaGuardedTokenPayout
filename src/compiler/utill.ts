import * as fs from "fs";
import * as path from "path";

export type RowCol = string[][];
export type Position = { row: number; col: number };

export function resolve(...pathSegments: string[]): string {
    return path.resolve(...pathSegments);
}

export function readFile(relPath: string): string {
    return fs.readFileSync(relPath, "utf-8");
}

export function saveFile(relPath: string, data: string): void {
    fs.writeFileSync(relPath, data, "utf-8");
}

export function strip(l: string): string {
    return l.trim();
}
export function lines(code: string): string[] {
    return code.split("\n");
}

export function insertCode(
    row: number,
    code: RowCol,
    insert: string[]
): RowCol {
    return [
        ...code.slice(0, row+1),
        ...insert.map((l) => l.split("")),
        ...code.slice(row, code.length),
    ];
}

export function removeCode(
    start: Position,
    end: Position,
    code: RowCol
): [RowCol, string] {
    const removed = [];
    for (let rowIndex = start.row; rowIndex < end.row + 1; rowIndex++) {
        for (
            let colIndex = rowIndex == start.row ? start.col : 0;
            colIndex < end.col;
            colIndex++
        ) {
            removed.push(code[rowIndex][colIndex]);
            code[rowIndex][colIndex] = "";
        }
        removed.push("\n");
    }
    //delete all except last row and first
    const rowDiff = end.row - start.row;
    if (rowDiff > 0) {
        code.splice(start.row + 1, end.row - start.row - 1);
    }
    return [code, removed.join("")];
}
