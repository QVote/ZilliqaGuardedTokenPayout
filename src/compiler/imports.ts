import {
    RowCol,
    Position,
    removeCode,
    readFile,
    resolve,
    insertCode,
} from "./utill";

/**
 * Match imports like:
 * @import {bystr20_len} from "./lib/ListLen.scillib"
 * @import {bystr20_len, otherFunctionName} from "../lib/ListLen.scillib"
 * @import {
 *  bystr20_len,
 *  otherFunctionName
 * } from "../lib/ListLen.scillib"
 */

function findAliasStart(lines: string[], alias: string): number {
    for (let i = 0; i < lines.length; i++) {
        const l = lines[i];
        const rep = l.replace(" ", "");
        if (rep.includes(`let${alias}`) || rep.includes(`type${alias}`)) {
            return i;
        }
    }
    throw new Error(`Couldn't find alias ${alias}`);
}

// for now literally looking for end of line
function findAliasEnd(start: number, lines: string[]): number {
    for (let i = start; i < lines.length; i++) {
        const l = lines[i];
        if (l.replace(/\s/g, "") == "") {
            return i;
        }
    }
    return lines.length - 1;
}

function getAlias(lines: string[], alias: string): string[] {
    const start = findAliasStart(lines, alias);
    const end = findAliasEnd(start, lines);
    return lines.slice(start,  end + 1);
}

function findImportEnd2(rowIndex: number, code: RowCol): Position {
    //increment row index until we find the end of the import
    let rowI = rowIndex;
    while (!code[rowI].includes("}")) {
        rowI++;
    }
    let dq = 0;
    // find index of second doublequote
    for (let colIndex = 0; colIndex < code[rowI].length; colIndex++) {
        const c = code[rowI][colIndex];
        if (c == '"') {
            dq++;
        }
        if (dq == 2) {
            return { row: rowI, col: colIndex + 1 };
        }
    }
    throw new Error('Couldn\'t find closing ""');
}

//return if the current row has an import sentinel
export function isImport(row: string[]): number {
    return row.join("").indexOf("@import");
}

//process import and return new code
export function processImport(
    rowIndex: number,
    importStartCol: number,
    code: RowCol,
    rootDir: string
): RowCol {
    const importEndsAt = findImportEnd2(rowIndex, code);
    const [newCode, removed] = removeCode(
        { row: rowIndex, col: importStartCol },
        importEndsAt,
        code
    );
    const statement = removed.split("\n").join("");
    const from = statement.split('"')[1];
    const aliases = statement
        .split("{")[1]
        .split("}")[0]
        .split(",")
        .filter((i) => i != "")
        .map((a) => a.trim());
    let codeWithAliases = newCode;
    const curFile = readFile(resolve(rootDir, from)).split("\n");
    let aliasCodes:string[] = [];
    for (const a of aliases) {
        const aliasCode = getAlias(curFile, a);
        aliasCodes = aliasCodes.concat(aliasCode);
    }
    codeWithAliases = insertCode(rowIndex, codeWithAliases, aliasCodes);
    return codeWithAliases;
}
