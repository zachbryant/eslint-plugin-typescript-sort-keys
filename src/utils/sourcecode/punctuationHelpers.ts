import { AST_NODE_TYPES, AST_TOKEN_TYPES } from '@typescript-eslint/utils'
import assert from 'assert'
import { Node, SourceCode } from 'types'
import { getEarliestNode, getLatestNode, getNextNonCommentNode } from './nodeHelpers'

export function getNodePunctuator(
  sourceCode: SourceCode,
  node: Node,
  punctuators = ',;',
) {
  const punctuator = sourceCode.getTokenAfter(node, {
    filter: n =>
      n.type === AST_TOKEN_TYPES.Punctuator &&
      n.value !== ':' &&
      new RegExp(`^[${punctuators}]$`).test(n.value),
    includeComments: false,
  })

  return punctuator ?? undefined
}

export function getNodeFollowingPunctuator(sourceCode: SourceCode, node: Node) {
  const punctuator = getNodePunctuator(sourceCode, node)
  if (!punctuator) return undefined
  return getNextNonCommentNode(sourceCode, punctuator)
}

/**
 * Returns the nodes for outer bracket punctuators of an interface or enum declaration.
 * Asserts that the punctuators exist due to use of non-null operator.
 */
export function getDeclarationPunctuators(sourceCode: SourceCode, body: Node[]) {
  const startNode = getEarliestNode(body)
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const declarationStartPunctuator = sourceCode.getTokenBefore(startNode)!
  assert(
    !!declarationStartPunctuator,
    `Expected declaration end punctuator after ${sourceCode.getText(startNode)}`,
  )
  //console.log('declarationStartPunctuator', declarationStartPunctuator)

  const endNode = getLatestNode(body) // Sometimes this is a comma
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const declarationEndPunctuator = getNodePunctuator(sourceCode, endNode, '}')!
  assert(
    !!declarationStartPunctuator,
    `Expected declaration end punctuator after ${sourceCode.getText(endNode)}`,
  )

  return { declarationStartPunctuator, declarationEndPunctuator }
}

// Returns a string containing the node's punctuation, if any.
export function getPunctuation(sourceCode: SourceCode, node: Node) {
  return (
    getNodePunctuator(sourceCode, node)?.value ??
    (node.type === AST_NODE_TYPES.TSEnumMember ? ',' : ';')
  )
}

export function getBodyRange(sourceCode: SourceCode, body: Node[]): [number, number] {
  const { declarationStartPunctuator, declarationEndPunctuator } =
    getDeclarationPunctuators(sourceCode, body)
  // Adjust start range ahead of the punctuator
  const start = declarationStartPunctuator.range[0] + 1
  const end = declarationEndPunctuator.range[0]

  return [start, end]
}
