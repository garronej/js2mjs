import { transformCodebase } from "../tools/transformCodebase";
import * as path from "path";
import { modifyImportExportStatementsFactory } from "./modifyImportExportStatements";
import { modifyImportExportStatement } from "./modifyImportExportStatement";
import { mv } from "../tools/mv";

export async function js2mjs(params: { srcDirPath: string; destDirPath: string | undefined }) {
    const { srcDirPath, destDirPath = path.join(path.dirname(srcDirPath), `${path.basename(srcDirPath)}_tmp`) } = params;

    const { modifyImportExportStatements } = modifyImportExportStatementsFactory({
        modifyImportExportStatement
    });

    await transformCodebase({
        srcDirPath,
        destDirPath,
        "transformSourceCodeString": async ({ sourceCode, filePath }) => {
            if (filePath.endsWith(".js.map")) {
                return {
                    "modifiedSourceCode": JSON.stringify(
                        (() => {
                            const o = JSON.parse(sourceCode);

                            return {
                                ...o,
                                "file": o["file"].replace(/js$/, "mjs")
                            };
                        })()
                    ),
                    "newFileName": path.basename(filePath).replace(/js\.map$/, "mjs.map")
                };
            }

            if (!/\.(?:js|d\.ts)$/i.test(filePath)) {
                return { "modifiedSourceCode": sourceCode };
            }

            return {
                "modifiedSourceCode": await modifyImportExportStatements({
                    sourceCode,
                    "dirPath": path.dirname(filePath)
                }),
                "newFileName": path.basename(filePath).replace(/js$/, "mjs")
            };
        }
    });

    if (params.destDirPath === undefined) {
        await mv({
            "srcDirPath": destDirPath,
            "destDirPath": srcDirPath
        });
    }
}
