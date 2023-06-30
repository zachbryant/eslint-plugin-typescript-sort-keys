import { JSONSchema4 } from 'json-schema'

import { getObjectBody } from 'utils/ast'
import { createReporter } from 'utils/plugin'
import { createRule, RuleMetaData } from 'utils/rule'
import {
  sortingOrderOptionSchema,
  SortingOrder,
  ErrorMessage,
  SortingOrderOption,
  SortingParamsOptions,
} from 'common/options'
import { TSESTree } from '@typescript-eslint/experimental-utils'

/**
 * The name of this rule.
 */
export const name = 'interface' as const

type SortingParams = SortingParamsOptions['caseSensitive'] &
  SortingParamsOptions['natural'] &
  SortingParamsOptions['requiredFirst']

/**
 * The options this rule can take.
 */
export type Options = [SortingOrderOption] | [SortingOrderOption, Partial<SortingParams>]

const sortingParamsOptionSchema: JSONSchema4 = {
  type: 'object',
  properties: {
    caseSensitive: {
      type: 'boolean',
    },
    natural: {
      type: 'boolean',
    },
    requiredFirst: {
      type: 'boolean',
    },
  },
  additionalProperties: false,
}

/**
 * The schema for the rule options.
 */
const schema: JSONSchema4[] = [sortingOrderOptionSchema, sortingParamsOptionSchema]

/**
 * The default options for the rule.
 */
const defaultOptions: Options = [
  SortingOrder.Ascending,
  { caseSensitive: true, natural: false, requiredFirst: false },
]

/**
 * The possible error messages.
 */
const errorMessages = {
  invalidOrderProperties: ErrorMessage.InterfaceInvalidOrder,
  invalidOrderParent: ErrorMessage.ParentInvalidOrder,
} as const

/**
 * The meta data for this rule.
 */
const meta: RuleMetaData<keyof typeof errorMessages> = {
  type: 'suggestion',
  docs: {
    description: 'require interface keys to be sorted',
    recommended: 'warn',
  },
  messages: errorMessages,
  fixable: 'code',
  schema,
}

/**
 * Create the rule.
 */
export const rule = createRule<keyof typeof errorMessages, Options>({
  name,
  meta,
  defaultOptions,

  create(context) {
    const compareNodeListAndReport = createReporter({
      context,
      createReportPropertiesObject: ({ loc }) => ({
        loc,
        messageId: 'invalidOrderProperties' as any,
      }),
      createReportParentObject: ({ loc }) => ({
        loc,
        messageId: 'invalidOrderParent' as any,
      }),
    })

    return {
      TSInterfaceDeclaration(node: TSESTree.TSInterfaceDeclaration) {
        const body = getObjectBody(node)

        return compareNodeListAndReport(node, body)
      },

      TSTypeLiteral(node: TSESTree.TSTypeLiteral) {
        const body = getObjectBody(node)

        return compareNodeListAndReport(node, body)
      },
    }
  },
})
