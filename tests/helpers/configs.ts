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

export const entriesToObject = <T = unknown>(
  value: readonly [string, T][],
): Record<string, T> => {
  return value.reduce<Record<string, T>>((memo, [k, v]) => {
    memo[k] = v
    return memo
  }, {})
}
