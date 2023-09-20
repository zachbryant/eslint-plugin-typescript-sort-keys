import { AllRuleOptions, CreateReporterArgs, SortingOrder } from '../types'

/**
 * Get the options from the context
 */
export function getOptions(
  context: CreateReporterArgs<string, AllRuleOptions>['context'],
) {
  const order = context.options[0] || SortingOrder.Ascending
  const options = context.options[1]
  const isAscending = order === SortingOrder.Ascending
  const isInsensitive = !options?.caseSensitive
  const isNatural = Boolean(options?.natural)
  const isRequiredFirst = Boolean(options?.requiredFirst)

  return {
    isAscending,
    isInsensitive,
    isNatural,
    isRequiredFirst,
    order,
  }
}
