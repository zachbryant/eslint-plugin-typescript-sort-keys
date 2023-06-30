import { JSONSchema4 } from 'json-schema'

import { TSESTree } from '@typescript-eslint/utils'
import { createReporter } from 'plugin'
import { getObjectBody } from 'utils/ast'
import { createRule, RuleMetaData } from 'utils/rule'
import {
  ErrorMessage,
  RuleOptionsGeneric,
  SortingOrder,
  sortingOrderOptionSchema,
  SortingParamsOptions,
} from '../types'

/**
 * The name of this rule.
 */
export const name = 'interface' as const

/**
 * The options this rule can take.
 */
export type RuleOptions = RuleOptionsGeneric<SortingParamsOptions>

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
const defaultOptions: RuleOptions = [
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
type errorMessageKeys = keyof typeof errorMessages

/**
 * The meta data for this rule.
 */
const meta: RuleMetaData<errorMessageKeys> = {
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
export const rule = createRule<errorMessageKeys, RuleOptions>({
  name,
  meta,
  defaultOptions,

  create(context) {
    const compareNodeListAndReport = createReporter({
      context,
      createReportPropertiesObject: ({ loc }: TSESTree.Node) => ({
        loc,
        messageId: 'invalidOrderProperties' as any,
      }),
      createReportParentObject: ({ loc }: TSESTree.Node) => ({
        loc,
        messageId: 'invalidOrderParent' as any,
      }),
    })

    return {
      TSInterfaceDeclaration(node) {
        const body = getObjectBody(node)

        return compareNodeListAndReport(node, body)
      },

      TSTypeLiteral(node) {
        const body = getObjectBody(node)

        return compareNodeListAndReport(node, body)
      },
    }
  },
})
