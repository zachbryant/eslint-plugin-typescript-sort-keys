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
import { getLineOfText, getReassembledBodyText } from './utils/sourceCodeHelper'

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
      // const startNodeIndentRange = getIndentRange(sourceCode, body[0])
      //const start = body[0].range[0] - (startNodeIndentRange[1] - startNodeIndentRange[0])
      const startNode = body[0]
      const startLineText = getLineOfText(sourceCode, startNode)
      const startNodeText = sourceCode.getText(startNode).trim()
      // Adjust the start range back by indent and any leading comments
      const start =
        startNode.range[0] -
        startLineText.substring(0, startLineText.indexOf(startNodeText)).length
      const endNode = body[body.length - 1]
      // The end of the body includes the punctuator and comments if any
      const end =
        endNode.range[1] -
        sourceCode.getText(endNode).length +
        getLineOfText(sourceCode, endNode).trimStart().length

      yield fixer.replaceTextRange(
        [start, end],
        getReassembledBodyText(sourceCode, sortedBody),
      )
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
