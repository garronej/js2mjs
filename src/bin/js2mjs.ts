#!/usr/bin/env node

import * as commanderStatic from "commander";
import { js2mjs } from "../lib/js2mjs";

commanderStatic
    .option("--src [srcDirPath]", `Usually src/esm`)
    .option("-o --out [outputDirPath]", `If not specified, the input dir will be overwritten`);

commanderStatic.parse(process.argv);

const options = commanderStatic.opts();

js2mjs({
    "srcDirPath": options.srcDirPath,
    "destDirPath": options.outputDirPath
});
