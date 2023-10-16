import { ESLint } from '@typescript-eslint/utils/ts-eslint'
import plugin from '../../src'
import recommended from '../../src/config/recommended.config'
import requiredFirst from '../../src/config/requiredFirst.config'
import { typescriptConfig } from './configs'

export enum Config {
  Recommended,
  RequiredFirst,
}

export function getESLint(config: Config, fix = true) {
  const eslint = new ESLint({
    overrideConfig: {
      ...(config === Config.Recommended ? recommended : requiredFirst),
      parser: typescriptConfig.parser,
      parserOptions: { sourceType: 'module' },
    },
    plugins: {
      'typescript-sort-keys': plugin,
    },
    useEslintrc: false,
    fix,
  })
  return eslint
}
