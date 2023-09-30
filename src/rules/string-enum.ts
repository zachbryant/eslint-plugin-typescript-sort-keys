import { AST_NODE_TYPES, TSESTree } from '@typescript-eslint/utils'
import { JSONSchema4 } from 'json-schema'
import { createReporter } from 'plugin'

import { getObjectBody } from 'utils/ast'
import { RuleMetaData, createRule } from 'utils/rule'
import {
  ErrorMessage,
  RuleOptionsGeneric,
  SortingOrder,
  SortingParamsOptions,
  sortingOrderOptionSchema,
} from '../types'

/**
 * The name of this rule.
 */
export const name = 'string-enum' as const

/**
 * The options this rule can take.
 */
export type RuleOptions = RuleOptionsGeneric<Omit<SortingParamsOptions, 'requiredFirst'>>

const sortingParamsOptionSchema: JSONSchema4 = {
  type: 'object',
  properties: {
    caseSensitive: {
      type: 'boolean',
    },
    natural: {
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
  { caseSensitive: true, natural: false },
]

/**
 * The possible error messages.
 */
const errorMessages = {
  invalidOrderProperties: ErrorMessage.StringEnumInvalidOrder,
  invalidOrderParent: ErrorMessage.StringEnumParentInvalidOrder,
} as const
type errorMessageKeys = keyof typeof errorMessages

/**
 * The meta data for this rule.
 */
const meta: RuleMetaData<errorMessageKeys> = {
  type: 'suggestion',
  docs: {
    description: 'require string enum members to be sorted',
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
      TSEnumDeclaration(node) {
        const body = getObjectBody(node) as TSESTree.TSEnumMember[]
        const isStringEnum = body.every(
          (member: TSESTree.TSEnumMember) =>
            member.initializer?.type === AST_NODE_TYPES.Literal &&
            typeof member.initializer?.value === 'string',
        )

        if (isStringEnum) {
          compareNodeListAndReport(node, body)
        }
      },
    }
  },
})
