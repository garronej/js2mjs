import * as path from "path";
import * as fs from "fs";
import { ParsedImportExportStatement } from "./ParsedImportExportStatement";

export async function modifyImportExportStatement(params: { dirPath: string; importExportStatement: string }): Promise<string> {
    const { dirPath, importExportStatement } = params;

    const parsedImportExportStatement = ParsedImportExportStatement.parse(params.importExportStatement);

    if (parsedImportExportStatement.parsedArgument.type !== "PROJECT LOCAL FILE") {
        return importExportStatement;
    }

    const { relativePath } = parsedImportExportStatement.parsedArgument;

    if (/\.json$/i.test(relativePath)) {
        return importExportStatement;
    }

    const stringify = (argument: string) =>
        ParsedImportExportStatement.stringify({
            ...parsedImportExportStatement,
            "parsedArgument": ParsedImportExportStatement.ParsedArgument.parse(argument)
        });

    for (const ext of ["ts", "tsx"]) {
        if (fs.existsSync(path.join(dirPath, `${relativePath}.${ext}`))) {
            return stringify(`${relativePath}.mjs`);
        }
    }

    return stringify(path.posix.join(relativePath, "index.mjs"));
}
