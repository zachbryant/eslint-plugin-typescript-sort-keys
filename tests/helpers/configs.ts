import { Linter } from '@typescript-eslint/utils/ts-eslint'
import * as path from 'path'

export const filename = path.join(__dirname, 'file.ts')

export const typescriptConfig: Linter.Config = {
  parser: require.resolve('@typescript-eslint/parser'),
  parserOptions: {
    sourceType: 'module',
    project: path.join(__dirname, './tsconfig.json'),
  },
}
