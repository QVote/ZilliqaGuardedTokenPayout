import { readFile, resolve, saveFile, lines, RowCol } from "./utill";
import { processImport, isImport } from "./imports";

function getParentDir() {
    if (require.main) return require.main.path;
    throw new Error("require main not defined");
}

function getRidOfRedundantBreaks(s: string): string {
    return s.replace(/(\r\n|\r|\n){2,}/g, "$1\n");
}

function eval2(code: RowCol, rootDir: string): RowCol {
    for (let rowIndex = 0; rowIndex < code.length; rowIndex++) {
        const row = code[rowIndex];
        const importStartCol = isImport(row);
        if (importStartCol != -1) {
            return eval2(
                processImport(rowIndex, importStartCol, code, rootDir),
                rootDir
            );
        }
    }
    return code;
}

export function compile(filePath: string, toFile: string): void {
    try {
        const rootDir = getParentDir();
        //split into rows and columns
        const code = readFile(resolve(rootDir, filePath))
            .split("\n")
            .map((l) => l.split(""));

        const toSave = eval2(code, rootDir)
            .map((l) => l.join(""))
            .join("\n");

        saveFile(resolve(rootDir, toFile), getRidOfRedundantBreaks(toSave));
    } catch (e) {
        console.error(e);
    }
}
