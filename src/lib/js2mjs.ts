import { transformCodebase } from "../tools/transformCodebase";
import * as path from "path";
import { modifyImportExportStatementsFactory } from "./modifyImportExportStatements";
import { modifyImportExportStatement } from "./modifyImportExportStatement";

export async function js2mjs(params: { srcDirPath: string; destDirPath: string }) {
    const { srcDirPath, destDirPath } = params;

    const { modifyImportExportStatements } = modifyImportExportStatementsFactory({
        modifyImportExportStatement
    });

    await transformCodebase({
        srcDirPath,
        destDirPath,
        "transformSourceCodeString": async ({ sourceCode, filePath }) => {
            console.log(filePath);

            if (!/\.(?:js)$/i.test(filePath)) {
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
}
