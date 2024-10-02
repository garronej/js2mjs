import * as crypto from "crypto";

export function modifyImportExportStatementsFactory(params: {
    modifyImportExportStatement: (params: { dirPath: string; importExportStatement: string }) => string;
}) {
    const { modifyImportExportStatement } = params;

    function modifyImportExportStatements(params: { dirPath: string; sourceCode: string }): { modifiedSourceCode: string } {
        const { dirPath, sourceCode } = params;

        let modifiedSourceCode = sourceCode;
        const modifiedImportExportStatementByHash = new Map<string, string>();

        for (const quoteSymbol of [`"`, `'`]) {
            const strRegExpInQuote = `${quoteSymbol}[^${quoteSymbol}\\r\\n]+${quoteSymbol}`;

            for (const regExpStr of [
                ...[
                    `export\\s+\\*\\s+from\\s*${strRegExpInQuote}`, //export * from "..."
                    `(?:import|export)(?:\\s+type)?\\s*\\*\\s*as\\s+[^\\s]+\\s+from\\s*${strRegExpInQuote}`, //import/export [type] * as ns from "..."
                    `(?:import|export)(?:\\s+type)?\\s*{[^}]*}\\s*from\\s*${strRegExpInQuote}`, //import/export [type] { Cat } from "..."
                    `import(?:\\s+type)?\\s+[^\\*{][^\\s]*\\s*(?:,\\s*{[^}]*})?\\s+from\\s*${strRegExpInQuote}`, //import [type] Foo[, { Bar, Baz }] from "..."
                    `import\\s*${strRegExpInQuote}`, //import "..."
                    `declare\\s+module\\s+${strRegExpInQuote}`
                ].map(s => `(?<=^|[\\r\\n\\s;])(?<! \\* )${s}`),
                `(?<=[^a-zA-Z._0-9$*])import\\s*\\(\\s*${strRegExpInQuote}\\s*\\)` //type Foo = import("...").Foo
            ]) {
                modifiedSourceCode = sourceCode.replaceAll(new RegExp(regExpStr, "g"), importExportStatement => {
                    const modifiedImportExportStatement = modifyImportExportStatement({
                        dirPath,
                        importExportStatement
                    });

                    const hash = crypto.createHash("sha256").update(modifiedImportExportStatement).digest("hex");

                    modifiedImportExportStatementByHash.set(hash, modifiedImportExportStatement);

                    return modifiedImportExportStatement;
                });
            }
        }

        for (const [hash, modifiedImportExportStatement] of modifiedImportExportStatementByHash) {
            modifiedSourceCode = modifiedSourceCode.replaceAll(hash, modifiedImportExportStatement);
        }

        return { modifiedSourceCode };
    }

    return { modifyImportExportStatements };
}
