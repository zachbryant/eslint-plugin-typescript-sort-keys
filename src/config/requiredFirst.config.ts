import { Linter } from '@typescript-eslint/utils/ts-eslint'
import { defaultOptions, defaultSortingOrder } from '../common/options'
import recommended from './recommended.config'

export default {
  plugins: recommended.plugins,
  rules: {
    ...recommended.rules,
    'typescript-sort-keys/interface': [
      'error' as const,
      defaultSortingOrder,
      { ...defaultOptions, requiredFirst: true },
    ] as Linter.RuleEntry,
  },
}
