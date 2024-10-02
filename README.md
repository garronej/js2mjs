# js2mjs

> WARNING: This modules messes up the sourcemaps. I didn't find a way to fix them.

Convert a ESM distribution that is using .js extension to an ESM distribution using .mjs extension.

## Motivation

Node.js is ESM compatible but it's a bit picky about the files extension. It expects import statements to include the file extension
and that `.mjs` be used instead of `.js`.  
So when you setup TypeScript to output an ESM distribution it will generate a distribution that isn't compatible with Node in `"type": "module"` mode.  
It's an ESM distribution that Vite, Next.js and other build tools will understand but not Node.  
This module let you patch the distribution so it can be used with node.

```bash
yarn add --dev js2mjs
npx tsc # Build your project we assume it generate dist/esm
npx js2mjs dist/esm # Your ESM distribution using .js extension will be updated to an ESM distribution using .mjs extension
```
