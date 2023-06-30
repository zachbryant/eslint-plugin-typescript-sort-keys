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
function getLineRange(sourceCode: SourceCode, node: TSESTree.Node): TSESTree.Range {
  const [start] = [getIndentRange(sourceCode, node)[0], node.range[1]]
  const index = sourceCode.lineStartIndices.findIndex(n => start === n)

  if (index < 0) {
    // Node is not at the beginning of the line
    return node.range
  }

  const lines = 1 + node.loc.end.line - node.loc.start.line

  return [sourceCode.lineStartIndices[index], sourceCode.lineStartIndices[index + lines]]
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

/**
 * Returns comments above a node, exclusively between the line of the
 * previous node and the line of the node.
 */
function getCommentsAbove(sourceCode: SourceCode, node: TSESTree.Node) {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const prevNode = sourceCode.getTokenBefore(node) ?? node.parent!
  const comments = sourceCode.getCommentsBefore(node)
  return comments.filter(comment => {
    const commentStartLine = comment.loc.start.line
    const commentEndLine = comment.loc.end.line

    return (
      commentStartLine > prevNode.loc.end.line && commentEndLine < node.loc.start.line
    )
  })
}

export function getReassembledBodyText(sourceCode: SourceCode, body: TSESTree.Node[]) {
  return body
    .map(node => {
      const commentsBefore = getCommentsAbove(sourceCode, node)

      const nodeText = [
        commentsBefore.map(_ => getLineOfText(sourceCode, _ as unknown as TSESTree.Node)),
        getLineOfText(sourceCode, node),
      ].join('')
      return nodeText
    })
    .join('')
}
