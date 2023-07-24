import { SortingOrder } from 'types'
import recommended from './recommended.config'
import { Linter } from 'eslint'

export default {
  plugins: recommended.plugins,
  rules: {
    ...recommended.rules,
    'typescript-sort-keys/interface': [
      'error' as const,
      SortingOrder.Ascending,
      { caseSensitive: true, natural: true, requiredFirst: true },
    ] as Linter.RuleEntry,
  },
}
