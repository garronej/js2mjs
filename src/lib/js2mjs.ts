import { transformCodebase } from "../tools/transformCodebase";
import { dirname as pathDirname, basename as pathBasename } from "path";
import { modifyImportExportStatementsFactory } from "./modifyImportExportStatements";
import { modifyImportExportStatement } from "./modifyImportExportStatement";
import * as fs from "fs";
import { assert } from "tsafe/assert";
import { typeGuard } from "tsafe/typeGuard";

export function js2mjs(params: { srcDirPath: string; destDirPath: string | undefined }) {
    const { srcDirPath, destDirPath = srcDirPath } = params;

    const { modifyImportExportStatements } = modifyImportExportStatementsFactory({
        modifyImportExportStatement
    });

    const sourceMapByFilePath = new Map<string, Buffer>();

    transformCodebase({
        srcDirPath,
        destDirPath,
        "transformSourceCode": ({ sourceCode: sourceCode_buffer, filePath }) => {
            map: {
                if (!filePath.endsWith(".js.map")) {
                    break map;
                }

                const parsed = JSON.parse(sourceCode_buffer.toString("utf8"));

                assert(typeGuard<{ file: String }>(parsed, true));

                const { file } = parsed;
                const newFile = file.replace(/js$/, "mjs");

                assert(newFile !== file);

                parsed.file = newFile;

                return {
                    "modifiedSourceCode": Buffer.from(JSON.stringify(parsed), "utf8"),
                    "newFileName": pathBasename(filePath).replace(/js\.map$/, "mjs.map")
                };
            }

            js: {
                if (!filePath.endsWith(".js")) {
                    break js;
                }

                let { modifiedSourceCode } = modifyImportExportStatements({
                    sourceCode: sourceCode_buffer.toString("utf8"),
                    "dirPath": pathDirname(filePath)
                });

                modifiedSourceCode = modifiedSourceCode.replace(
                    /\/\/# sourceMappingURL=(.+\.)js\.map$/,
                    (...[, group]) => `//# sourceMappingURL=${group}mjs.map`
                );

                return {
                    "newFileName": pathBasename(filePath).replace(/js$/, "mjs"),
                    "modifiedSourceCode": Buffer.from(modifiedSourceCode, "utf8")
                };
            }

            return { "modifiedSourceCode": sourceCode_buffer };
        }
    });

    for (const [filePath, sourceMap] of sourceMapByFilePath) {
        fs.writeFileSync(filePath, sourceMap);
    }
}
