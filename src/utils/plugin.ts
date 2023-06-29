import { TSESTree, AST_TOKEN_TYPES } from '@typescript-eslint/experimental-utils'

import {
  RuleContext as UtilRuleContext,
  RuleFixer,
  RuleFix,
  SourceCode,
} from '@typescript-eslint/experimental-utils/dist/ts-eslint'
import assert from 'assert'

import { SortingOrder } from 'common/options'
import { Options as InterfaceRuleOptions } from 'rules/interface'
import { Options as StringEnumRuleOptions } from 'rules/string-enum'
import { getPropertyName, getPropertyIsOptional } from './ast'
import { compareFn } from './compare'

type RuleOptions = InterfaceRuleOptions & StringEnumRuleOptions

type TSType = TSESTree.TypeElement | TSESTree.TSEnumMember

type NodePositionInfo = { initialIndex: number; finalIndex: number }

/**
 * @param context The rule context.
 * @returns A function that swaps two nodes.
 */
function createNodeSwapper(context: UtilRuleContext<string, RuleOptions>) {
  const sourceCode = context.getSourceCode() as SourceCode & {
    lineStartIndices: number[]
  }

  /**
   * Returns the indent range of a node if it's the first on its line.
   * Otherwise, returns a range starting immediately after the previous sibling.
   */
  function getIndentRange(node: TSESTree.Node | TSESTree.Comment): TSESTree.Range {
    const prevSibling = sourceCode.getTokenBefore(node)
    const end = node.range[0]
    const start =
      prevSibling && prevSibling.loc.start.line === node.loc.start.line
        ? prevSibling.range[1] + 1
        : node.range[0] - node.loc.start.column

    return [start, end]
  }

  function getRangeWithIndent(node: TSESTree.Comment) {
    return [getIndentRange(node)[0], node.range[1]]
  }

  /**
   * Returns the range for the entire line, including EOL, if node is the only
   * token on its lines. Otherwise, returns the node range.
   */
  function getLineRange(node: TSESTree.Comment): TSESTree.Range {
    const [start] = getRangeWithIndent(node)
    const index = sourceCode.lineStartIndices.findIndex(n => start === n)

    if (index < 0) {
      // Node is not at the beginning of the line
      return node.range
    }

    const lines = 1 + node.loc.end.line - node.loc.start.line

    return [
      sourceCode.lineStartIndices[index],
      sourceCode.lineStartIndices[index + lines],
    ]
  }

  function getIndentText(node: TSESTree.Node) {
    return sourceCode.text.slice(...getIndentRange(node))
  }

  function getNodePunctuator(node: TSESTree.Node) {
    const punctuator = sourceCode.getTokenAfter(node, {
      filter: n => n.type === AST_TOKEN_TYPES.Punctuator && n.value !== ':',
      includeComments: false,
    })

    // Check the punctuator value outside of filter because we
    // want to stop traversal on any terminating punctuator
    return punctuator && /^[,;]$/.test(punctuator.value) ? punctuator : undefined
  }

  return (
    fixer: RuleFixer,
    nodePositions: Map<TSType, NodePositionInfo>,
    currentNode: TSType,
    replaceNode: TSType,
  ) =>
    [currentNode, replaceNode].reduce<RuleFix[]>((acc, node) => {
      const otherNode = node === currentNode ? replaceNode : currentNode
      const comments = sourceCode.getCommentsBefore(node)
      const nextSibling = sourceCode.getTokenAfter(node)
      const isLastReplacingLast =
        nodePositions.get(node)?.finalIndex === nodePositions.size - 1 &&
        nodePositions.get(node)?.finalIndex === nodePositions.get(otherNode)?.initialIndex

      let text = [
        comments.length ? getIndentText(node) : '',
        sourceCode.getText(node),
      ].join('')

      // If nextSibling is the node punctuator, remove it
      if (nextSibling === getNodePunctuator(node)) {
        acc.push(fixer.remove(nextSibling))
      }

      if (!/[,;]$/.test(text)) {
        // Add a punctuator if the node doesn't already have one
        text += ','
      }

      if (isLastReplacingLast) {
        // If we're moving the last node to its final destination, we can remove the punctuator
        text = text.replace(/,$/, '')
      }

      if (comments.length) {
        // Insert leading comments above the other node
        acc.push(
          fixer.insertTextBefore(
            otherNode,
            comments
              .map(comment => sourceCode.getText(comment as any))
              .concat('')
              .join('\n'),
          ),
        )
      }

      acc.push(
        // Insert the node before the other node
        fixer.insertTextBefore(otherNode, text),
        // Remove the original instance of node
        fixer.remove(node),
        // Remove the original instances of node comments
        ...comments.map(n => fixer.removeRange(getLineRange(n))),
      )

      return acc
    }, [])
}

export function createReporter<MessageIds extends string>(
  context: UtilRuleContext<MessageIds, RuleOptions>,
  createReportObject: (node: TSESTree.Node) => {
    readonly loc: TSESTree.SourceLocation
    readonly messageId: MessageIds
  },
) {
  // Parse options.
  const order = context.options[0] || SortingOrder.Ascending
  const options = context.options[1]
  const isAscending = order === SortingOrder.Ascending
  const isInsensitive = (options && options.caseSensitive) === false
  const isNatural = Boolean(options && options.natural)
  const isRequiredFirst = (options && options.requiredFirst) === true

  const compare = compareFn(isAscending, isInsensitive, isNatural)
  const swapNodes = createNodeSwapper(context)
  const sortFunction = (a: TSType, b: TSType) =>
    compare(getPropertyName(a), getPropertyName(b))

  return (body: TSType[]) => {
    const sortedBody = isRequiredFirst
      ? [
          ...body
            .slice(0)
            .filter(node => !getPropertyIsOptional(node))
            .sort(sortFunction),
          ...body
            .slice(0)
            .filter(node => getPropertyIsOptional(node))
            .sort(sortFunction),
        ]
      : body.slice(0).sort(sortFunction)

    const nodePositions = new Map<TSType, NodePositionInfo>(
      body.map((n, index) => [
        n,
        { initialIndex: index, finalIndex: sortedBody.indexOf(n) },
      ]),
    )

    for (const [node, nodePositionInfo] of nodePositions.entries()) {
      const { initialIndex, finalIndex } = nodePositionInfo
      if (initialIndex !== finalIndex) {
        const nodeToReplace = body[finalIndex]
        const { loc, messageId } = createReportObject(node)

        // Sanity check
        assert(loc, 'createReportObject return value must include a node location')

        assert(
          messageId,
          'createReportObject return value must include a problem message',
        )

        const messageShouldBeWhere =
          finalIndex === sortedBody.length - 1
            ? 'at the end'
            : `before '${getPropertyName(sortedBody[finalIndex + 1])}'`

        context.report({
          loc,
          messageId,
          node: node,
          data: {
            nodeName: getPropertyName(node),
            messageShouldBeWhere,
            order,
            insensitive: isInsensitive ? 'insensitive ' : '',
            natural: isNatural ? 'natural ' : '',
            requiredFirst: isRequiredFirst ? 'required first ' : '',
          },

          fix: fixer => swapNodes(fixer, nodePositions, node, nodeToReplace),
        })
      }
    }
  }
}
