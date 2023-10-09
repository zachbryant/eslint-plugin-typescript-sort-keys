import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import resolve from '@rollup/plugin-node-resolve'
import terser from '@rollup/plugin-terser'
import typescript from '@rollup/plugin-typescript'
import assert from 'assert'
import fs from 'fs'
import path from 'path'

const minify = !!process.env.MINIFY

const filePath = './tsconfig.json'
const config = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
assert(config)
const baseUrl = config.compilerOptions.baseUrl

const internalFolders = fs
  .readdirSync(baseUrl, { withFileTypes: true })
  .filter(dir => dir.isDirectory())
  .map(dir => path.resolve(process.cwd(), baseUrl, dir.name))

const isExternal = id =>
  !id.startsWith('.') &&
  !id.startsWith('/') &&
  !id.startsWith('\0') &&
  !internalFolders.some(mapping => id.startsWith(mapping))

const outputDirectory = 'lib'

export default [
  {
    input: './src/index.ts',
    external: isExternal,
    output: [
      {
        dir: outputDirectory,
        entryFileNames: '[name].cjs.js',
        format: 'cjs',
        sourcemap: true,
      },
      {
        dir: outputDirectory,
        entryFileNames: '[name].esm.js',
        format: 'es',
        sourcemap: true,
      },
    ],
    plugins: [commonjs(), resolve(), typescript(), json(), minify && terser()],
  },
]
