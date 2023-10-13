import { Linter } from '@typescript-eslint/utils/ts-eslint'
import path from 'path'

const configPath = path.resolve(__dirname, '../config')
export const filename = path.join(configPath, 'file.ts')

export const typescriptConfig: Linter.Config = {
  parser: require.resolve('@typescript-eslint/parser'),
  parserOptions: {
    sourceType: 'module',
    project: path.join(configPath, 'tsconfig.json'),
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
