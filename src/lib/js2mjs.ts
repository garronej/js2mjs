import { transformCodebase } from "../tools/transformCodebase";
import { join as pathJoin, dirname as pathDirname, basename as pathBasename } from "path";
import { modifyImportExportStatementsFactory } from "./modifyImportExportStatements";
import { modifyImportExportStatement } from "./modifyImportExportStatement";
import MagicString from "magic-string";
import * as fs from "fs";

export function js2mjs(params: { srcDirPath: string; destDirPath: string | undefined }) {
    const { srcDirPath, destDirPath = srcDirPath } = params;

    const { modifyImportExportStatements } = modifyImportExportStatementsFactory({
        modifyImportExportStatement
    });

    const sourceMapByFilePath = new Map<string, Buffer>();

    transformCodebase({
        srcDirPath,
        destDirPath,
        "transformSourceCode": ({ sourceCode, fileRelativePath, filePath }) => {
            if (fileRelativePath.endsWith(".js.map")) {
                return undefined;
            }

            if (fileRelativePath.endsWith(".d.ts")) {
                return { "modifiedSourceCode": sourceCode };
            }

            if (!fileRelativePath.endsWith(".js")) {
                return { "modifiedSourceCode": sourceCode };
            }

            const magicString = new MagicString(sourceCode.toString("utf8"));

            modifyImportExportStatements({
                magicString,
                "dirPath": pathDirname(filePath)
            });

            magicString.replace(/\/\/# sourceMappingURL=(.+\.)js\.map$/, (...[, group]) => `//# sourceMappingURL=${group}mjs.map`);

            const newBasename = pathBasename(fileRelativePath).replace(/js$/, "mjs");
            const newBasename_map = `${newBasename}.map`;

            const sourceMap = magicString.generateMap({
                source: newBasename,
                file: newBasename_map,
                includeContent: true,
                hires: true
            });

            sourceMapByFilePath.set(pathJoin(destDirPath, pathDirname(fileRelativePath), newBasename_map), Buffer.from(sourceMap.toString(), "utf8"));

            return {
                "newFileName": newBasename,
                "modifiedSourceCode": Buffer.from(magicString.toString(), "utf8")
            };
        }
    });

    for (const [filePath, sourceMap] of sourceMapByFilePath) {
        fs.writeFileSync(filePath, sourceMap);
    }
}
