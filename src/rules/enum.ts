import { TSESTree } from '@typescript-eslint/utils'
import { JSONSchema4 } from '@typescript-eslint/utils/json-schema'

import { RuleNames } from '../config/constants'
import { createReporter } from '../plugin'
import {
  ErrorMessage,
  RuleOptionsGeneric,
  SortingOrder,
  sortingOrderOptionSchema,
  SortingParams,
} from '../types'
import { getObjectBody } from '../utils/ast'
import { createRule, RuleMetaData } from '../utils/rule'

/**
 * The name of this rule.
 */
export const name = RuleNames.Enum as const

/**
 * The options this rule can take.
 */
export type RuleOptions = RuleOptionsGeneric<Omit<SortingParams, 'requiredFirst'>>

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
  invalidOrderBody: ErrorMessage.EnumInvalidOrder,
  invalidOrderParent: ErrorMessage.EnumParentInvalidOrder,
} as const
type errorMessageKeys = keyof typeof errorMessages

/**
 * The meta data for this rule.
 */
const meta: RuleMetaData<errorMessageKeys> = {
  type: 'suggestion',
  docs: {
    description: 'require enum members to be sorted',
    recommended: 'stylistic',
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
      createReportPropertiesObject: (loc: TSESTree.SourceLocation) => ({
        loc,
        messageId: 'invalidOrderBody' as any,
      }),
      createReportParentObject: (loc: TSESTree.SourceLocation) => ({
        loc,
        messageId: 'invalidOrderParent' as any,
      }),
    })

    return {
      TSEnumDeclaration(node: TSESTree.TSEnumDeclaration) {
        const body = getObjectBody(node) as TSESTree.TSEnumMember[]
        compareNodeListAndReport(node, body)
      },
    }
  },
})
