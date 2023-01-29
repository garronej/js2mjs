#!/usr/bin/env node

import { js2mjs } from "../lib/js2mjs";

const [, , srcDirPath, destDirPath] = process.argv;

js2mjs({
    "srcDirPath": srcDirPath,
    "destDirPath": destDirPath || undefined
});
