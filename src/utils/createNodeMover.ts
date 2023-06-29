import {
  SourceCode as Lib_SourceCode,
  RuleFix,
  RuleFixer,
  RuleContext as UtilRuleContext,
} from '@typescript-eslint/experimental-utils/dist/ts-eslint'
import {
  AST_TOKEN_TYPES,
  TSESTree,
} from '@typescript-eslint/experimental-utils/dist/ts-estree'
import { RuleOptions, TSType } from 'common/types'

type SourceCode = Lib_SourceCode & {
  lineStartIndices: number[]
}

/**
 * Returns the indent range of a node if it's the first on its line.
 * Otherwise, returns a range starting immediately after the previous sibling.
 */
function getIndentRange(
  sourceCode: SourceCode,
  node: TSESTree.Node | TSESTree.Comment,
): TSESTree.Range {
  const prevSibling = sourceCode.getTokenBefore(node)
  const end = node.range[0]
  const start =
    prevSibling && prevSibling.loc.start.line === node.loc.start.line
      ? prevSibling.range[1] + 1
      : node.range[0] - node.loc.start.column

  return [start, end]
}

function getRangeWithIndent(sourceCode: SourceCode, node: TSESTree.Comment) {
  return [getIndentRange(sourceCode, node)[0], node.range[1]]
}

/**
 * Returns the range for the entire line, including EOL, if node is the only
 * token on its lines. Otherwise, returns the node range.
 */
export function getLineRange(
  sourceCode: SourceCode,
  node: TSESTree.Comment,
): TSESTree.Range {
  const [start] = getRangeWithIndent(sourceCode, node)
  const index = sourceCode.lineStartIndices.findIndex(n => start === n)

  if (index < 0) {
    // Node is not at the beginning of the line
    return node.range
  }

  const lines = 1 + node.loc.end.line - node.loc.start.line

  return [sourceCode.lineStartIndices[index], sourceCode.lineStartIndices[index + lines]]
}

function getIndentText(sourceCode: SourceCode, node: TSESTree.Node) {
  return sourceCode.text.slice(...getIndentRange(sourceCode, node))
}

function getNodePunctuator(sourceCode: SourceCode, node: TSESTree.Node) {
  const punctuator = sourceCode.getTokenAfter(node, {
    filter: n => n.type === AST_TOKEN_TYPES.Punctuator && n.value !== ':',
    includeComments: false,
  })

  // Check the punctuator value outside of filter because we
  // want to stop traversal on any terminating punctuator
  return punctuator && /^[,;]$/.test(punctuator.value) ? punctuator : { value: '' }
}

/**
 * @param context The rule context.
 * @returns A function that moves a node to a desired position.
 */
export function createNodeMover(context: UtilRuleContext<string, RuleOptions>) {
  const sourceCode = context.getSourceCode() as SourceCode

  return (
    fixer: RuleFixer,
    node: TSType,
    nextSortedNode?: TSType,
    prevSortedNode?: TSType,
  ) => {
    const fixActions = [] as RuleFix[]
    const comments = sourceCode.getCommentsBefore(node)

    let nodeText = [
      comments.length ? getIndentText(sourceCode, node) : '',
      sourceCode.getText(node),
    ].join('')

    const punctuator = getNodePunctuator(sourceCode, node)
    const nextSibling = sourceCode.getTokenAfter(node)
    // If nextSibling is the node punctuator, remove it
    if (nextSibling === punctuator) {
      fixActions.push(fixer.remove(nextSibling))
    }

    if (!/[,;]$/.test(nodeText)) {
      // Add a punctuator if the node doesn't already have one
      nodeText += punctuator.value
    }

    if (!nextSortedNode) {
      // If we're moving the last node to its final destination, we can remove a comma
      nodeText = nodeText.replace(/,$/, '')
    }

    if (comments.length) {
      const commentText = comments
        .map(comment => sourceCode.getText(comment as any))
        .concat('')
        .join('\n')
      // Insert leading comments above the other node
      if (nextSortedNode)
        fixActions.push(fixer.insertTextBefore(nextSortedNode, commentText))
      else if (prevSortedNode)
        fixActions.push(fixer.insertTextAfter(prevSortedNode, commentText))
    }

    // Insert the node before the other node
    if (nextSortedNode) fixActions.push(fixer.insertTextBefore(nextSortedNode, nodeText))
    else if (prevSortedNode)
      fixActions.push(fixer.insertTextAfter(prevSortedNode, nodeText))

    fixActions.push(
      // Remove the original instance of node
      fixer.remove(node),
      // Remove the original instances of node comments
      ...comments.map(_ => fixer.removeRange(getLineRange(sourceCode, _))),
    )
    return fixActions
  }
}
