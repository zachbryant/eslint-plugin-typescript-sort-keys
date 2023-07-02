import assert from 'assert'

import { getOptions } from 'common/options'
import {
  AllRuleOptions,
  CreateReporterArgs,
  NodePositionInfo,
  SourceCode,
  TSType,
} from './types'
import { getPropertyName } from './utils/ast'
import { getFixedBodyText } from './utils/sourceCodeHelper'

import { TSESLint, TSESTree } from '@typescript-eslint/utils'

export function reportParentNode(
  createReporterArgs: Omit<
    CreateReporterArgs<string, AllRuleOptions>,
    'createReportPropertiesObject'
  >,
  bodyParent: TSESTree.Node,
  body: TSType[],
  sortedBody: TSType[],
  unsortedCount: number,
) {
  const { loc, messageId } = createReporterArgs.createReportParentObject(bodyParent)

  createReporterArgs.context.report({
    loc,
    messageId,
    node: bodyParent,
    data: {
      unsortedCount,
    },

    *fix(fixer: TSESLint.RuleFixer) {
      // Replace the entire body with the sorted body
      const sourceCode = createReporterArgs.context.getSourceCode() as SourceCode

      const startNode = body[0]
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const declarationStartPunctuator = sourceCode.getTokenBefore(startNode)!
      const endNode = body[body.length - 1]
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const declarationEndPunctuator = sourceCode.getTokenAfter(endNode)!
      // Adjust the start range back by indent and any leading comments
      const start = declarationStartPunctuator.range[0] + 1
      // The end of the body includes the punctuator and comments if any
      const end = declarationEndPunctuator.range[0]

      const fixedBodyText = getFixedBodyText(sourceCode, sortedBody, body)
      yield fixer.replaceTextRange([start, end], fixedBodyText)
    },
  })
}

export function reportUnsortedBody(
  createReporterArgs: Omit<
    CreateReporterArgs<string, AllRuleOptions>,
    'createReportParentObject'
  >,
  nodePositions: Map<TSType, NodePositionInfo>,
  sortedBody: TSType[],
) {
  const { isInsensitive, isNatural, isRequiredFirst, order } = getOptions(
    createReporterArgs.context,
  )
  for (const [node, nodePositionInfo] of nodePositions.entries()) {
    const { initialIndex, finalIndex } = nodePositionInfo
    // If the node is not in the correct position, report it
    if (initialIndex !== finalIndex) {
      const { loc, messageId } = createReporterArgs.createReportPropertiesObject(node)

      // Sanity check
      assert(loc, 'createReportObject return value must include a node location')
      assert(messageId, 'createReportObject return value must include a problem message')

      const nextSortedNode =
        finalIndex + 1 < sortedBody.length ? sortedBody[finalIndex + 1] : undefined

      createReporterArgs.context.report({
        loc,
        messageId,
        node,
        data: {
          nodeName: getPropertyName(node),
          messageShouldBeWhere: nextSortedNode
            ? `before '${getPropertyName(nextSortedNode)}'`
            : 'at the end',
          order,
          insensitive: isInsensitive ? 'insensitive ' : '',
          natural: isNatural ? 'natural ' : '',
          requiredFirst: isRequiredFirst ? 'required first ' : '',
        },
      })
    }
  }
}
