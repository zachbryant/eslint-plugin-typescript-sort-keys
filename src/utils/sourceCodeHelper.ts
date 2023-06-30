import { SourceCode as Lib_SourceCode } from '@typescript-eslint/experimental-utils/dist/ts-eslint'
import {
  AST_NODE_TYPES,
  AST_TOKEN_TYPES,
  TSESTree,
} from '@typescript-eslint/experimental-utils/dist/ts-estree'

export type SourceCode = Lib_SourceCode & {
  lineStartIndices: number[]
}

export function isInterface(node: TSESTree.Node) {
  switch (node.type) {
    case AST_NODE_TYPES.TSInterfaceDeclaration:
    case AST_NODE_TYPES.TSTypeLiteral:
      return true
    default:
      return false
  }
}

/**
 * Returns the indent range of a node if it's the first on its line.
 * Otherwise, returns a range starting immediately after the previous sibling.
 */
export function getIndentRange(
  sourceCode: SourceCode,
  node: TSESTree.Node | TSESTree.Comment,
): TSESTree.Range {
  const prevSibling = sourceCode.getTokenBefore(node)
  const end = node.range[0]
  const start =
    prevSibling?.loc.start.line === node.loc.start.line
      ? prevSibling.range[1] + 1
      : end - node.loc.start.column

  return [start, end]
}

/**
 * Returns the range for the entire line, including EOL, if node is the only
 * token on its lines. Otherwise, returns the node range.
 */
export function getLineRange(
  sourceCode: SourceCode,
  node: TSESTree.Node,
): TSESTree.Range {
  const [start] = [getIndentRange(sourceCode, node)[0], node.range[1]]
  const index = sourceCode.lineStartIndices.findIndex(n => start === n)

  if (index < 0) {
    // Node is not at the beginning of the line
    return node.range
  }

  const lines = 1 + node.loc.end.line - node.loc.start.line

  return [sourceCode.lineStartIndices[index], sourceCode.lineStartIndices[index + lines]]
}

/**
 * Returns the text of the indent of a node if it's the first on its line.
 */
export function getTextWithIndent(sourceCode: SourceCode, node: TSESTree.Node) {
  return sourceCode.text.slice(...getIndentRange(sourceCode, node))
}

export function getLineOfText(sourceCode: SourceCode, node: TSESTree.Node) {
  return sourceCode.text.slice(...getLineRange(sourceCode, node))
}

/**
 * The punctuator after the node, if any.
 */
export function getNodePunctuator(sourceCode: SourceCode, node: TSESTree.Node) {
  const punctuator = sourceCode.getTokenAfter(node, {
    filter: n => n.type === AST_TOKEN_TYPES.Punctuator && n.value !== ':',
    includeComments: false,
  })

  // Check the punctuator value outside of filter because we
  // want to stop traversal on any terminating punctuator
  return punctuator && /^[,;]$/.test(punctuator.value) ? punctuator : undefined
}

export function getReassembledNodeText(
  sourceCode: SourceCode,
  _bodyParent: TSESTree.Node,
  node: TSESTree.Node,
) {
  // const commentsBefore = sourceCode.getCommentsBefore(node)
  // const commentsAfter = sourceCode
  //   .getCommentsAfter(node)
  //   .filter(comment => comment.loc.start.line === node.loc.end.line)
  const nodeText = getLineOfText(sourceCode, node)
  console.log(getLineOfText(sourceCode, node))

  // const commentText = commentsBefore
  //   .map(comment => sourceCode.getText(comment as any))
  //   .concat('')
  //   .join('\n')
  // get space between previous node or start of line and node

  return nodeText
}

export function getReassembledBodyText(
  sourceCode: SourceCode,
  bodyParent: TSESTree.Node,
  body: TSESTree.Node[],
) {
  // const shouldHaveNewline = body.some(
  //   (node, _, nodes) => node.loc.start.line !== nodes[0].loc.start.line,
  // )
  // const lineSeparator = shouldHaveNewline ? '\n' : ''

  return body.map(node => getReassembledNodeText(sourceCode, bodyParent, node)).join('')
}
