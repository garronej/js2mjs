import { transformCodebase } from "../tools/transformCodebase";
import * as fs from "fs/promises";

export async function mv(params: { srcDirPath: string; destDirPath: string }) {
    const { srcDirPath, destDirPath } = params;

    await fs.rm(destDirPath, { "recursive": true });

    await transformCodebase({
        srcDirPath,
        destDirPath,
        "transformSourceCodeString": async ({ sourceCode }) => ({ "modifiedSourceCode": sourceCode })
    });

    await fs.rm(srcDirPath, { "recursive": true });
}
