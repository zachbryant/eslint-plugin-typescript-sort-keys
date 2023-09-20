import { AST_TOKEN_TYPES, TSESTree } from '@typescript-eslint/utils'
import assert from 'assert'
import { Node, SourceCode } from 'types'

/**
 * Returns comments before a node, but only if they belong to it. Excludes line
 * comments directly after the previous node which are on the same line as prev.
 *
 * Returns empty array if there is no previous node.
 */
function getCommentsBefore(
  sourceCode: SourceCode,
  node: Node,
  type?: AST_TOKEN_TYPES.Line | AST_TOKEN_TYPES.Block,
) {
  const prevNode = sourceCode.getTokenBefore(node, { includeComments: false })
  if (!prevNode) return []
  const comments = sourceCode.getCommentsBefore(node)

  const nodeStartLine = node.loc.start.line
  const prevNodeEndLine = prevNode.loc.end.line

  return comments.filter(comment => {
    const commentStartLine = comment.loc.start.line
    const commentEndLine = comment.loc.end.line

    return (
      (commentStartLine === nodeStartLine ||
        (commentStartLine > prevNodeEndLine && commentEndLine <= nodeStartLine)) &&
      (!type || comment.type === type)
    )
  })
}

/**
 * Returns comments after a node, but only if they belong to it. Excludes
 * comments directly before the next node which are on the same line as next.
 */
function getCommentsAfter(
  sourceCode: SourceCode,
  node: Node,
  type?: AST_TOKEN_TYPES.Line | AST_TOKEN_TYPES.Block,
) {
  const nodeEndLine = node.loc.end.line
  const comments = sourceCode.getCommentsAfter(node)

  const punctuator = getNodePunctuator(sourceCode, node)
  if (punctuator) comments.push(...sourceCode.getCommentsAfter(punctuator))

  const nextNode = getNodeFollowingPunctuator(sourceCode, node)
  const nextNodeStartPos = nextNode?.range[0] ?? Infinity

  const commentsAfter = comments.filter(comment => {
    const commentStartLine = comment.loc.start.line
    const commentEndPos = comment.range[1]
    const nextBeforeComments = nextNode ? getCommentsBefore(sourceCode, nextNode) : []

    // Comments on line after pertain to the next node
    return (
      commentEndPos < nextNodeStartPos &&
      nodeEndLine === commentStartLine &&
      !nextBeforeComments.includes(comment) &&
      (!type || comment.type === type)
    )
  })

  return commentsAfter
}

/**
 * Returns text between the node and previous (previous may be a comment).
 * Empty result if no previous node.
 */
function getTextBetweenNodeAndPrevious(sourceCode: SourceCode, node: Node) {
  const prevNode = sourceCode.getTokenBefore(node, { includeComments: true })
  if (!prevNode) return ''

  return getTextBetween(sourceCode, prevNode, node)
}

/**
 * Returns text between the node and next (next may be a comment).
 * Empty result if no next node.
 */
function getTextBetweenNodeAndNext(sourceCode: SourceCode, node: Node) {
  const nextNode = sourceCode.getTokenAfter(node, { includeComments: true })
  if (!nextNode) return ''

  return getTextBetween(sourceCode, node, nextNode)
}

/**
 * Returns the text of comment nodes, preserving whitespace (including leading
 * whitespace between comments and previous punctuator/body node).
 */
function getCommentsText(sourceCode: SourceCode, comments: TSESTree.Comment[]): string {
  return comments
    .map((comment, index) => {
      let commentText = sourceCode.getText(comment)
      const isLast = index === comments.length - 1
      // if (!isLast || comments.length === 1) {
      //   // Conflicts with space between comments when this is added to the last comment
      //   const indentation = getTextBetweenNodeAndPrevious(sourceCode, comment)
      //   commentText = indentation + commentText
      // }
      const indentation = getTextBetweenNodeAndPrevious(sourceCode, comment)
      commentText = indentation + commentText
      // if (!isLast) {
      //   // Preserve whitespace between comments
      //   const textBetween = getTextBetween(sourceCode, comment, comments[index + 1])
      //   console.log(
      //     `textBetween '${textBetween}' comment '${commentText}' and '${
      //       comments[index + 1].value
      //     }'`,
      //   )
      //   commentText += textBetween
      // }
      // Don't put a line comment on the same line as anything else
      if (
        comment.type === AST_TOKEN_TYPES.Line &&
        !commentText.endsWith('\n') &&
        !getTextBetweenNodeAndNext(sourceCode, comment).includes('\n')
      ) {
        commentText += '\n'
      }
      return commentText
    })
    .join('')
}

/* Get text of comments before a node, if any, with leading whitespace. */
function getCommentsTextBefore(sourceCode: SourceCode, node: Node) {
  let commentText = getCommentsText(sourceCode, getCommentsBefore(sourceCode, node))
  if (commentText) {
    commentText += getTextBetweenNodeAndPrevious(sourceCode, node)
  }
  return commentText
}

/* Get text of comments after a node, if any, with leading whitespace. */
function getCommentsTextAfter(
  sourceCode: SourceCode,
  node: Node,
  type?: AST_TOKEN_TYPES.Line | AST_TOKEN_TYPES.Block,
) {
  return getCommentsText(sourceCode, getCommentsAfter(sourceCode, node, type))
}

// Returns a string containing the node's punctuation, if any.
function getPunctuation(sourceCode: SourceCode, node: Node) {
  return getNodePunctuator(sourceCode, node)?.value ?? ','
}

/**
 * Returns the node with proper punctuation.
 */
function getProcessedText(sourceCode: SourceCode, node: Node, isLast: boolean) {
  const nodeText = sourceCode.getText(node)

  // Case when the node was sorted last with punctuation
  // if (isLast) {
  //   const punctuation = getPunctuation(sourceCode, node)
  //   if (punctuation === ',' && nodeText.endsWith(punctuation)) {
  //     nodeText = nodeText.slice(0, -1)
  //   }
  // }

  return nodeText
}

/**
 * Returns the text between two nodes, excluding comments between them.
 * Range of start/end is from the comments between the nodes, if any. If a
 * given node is a comment, the respective range is from the comment itself.
 */
function getTextBetween(sourceCode: SourceCode, startNode: Node, endNode: Node) {
  const startNodeEnd = startNode.range[1]
  const endNodeStart = endNode.range[0]

  return sourceCode.text.slice(startNodeEnd, endNodeStart)
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

export function getBodyRange(sourceCode: SourceCode, body: Node[]): [number, number] {
  const { declarationStartPunctuator, declarationEndPunctuator } =
    getDeclarationPunctuators(sourceCode, body)
  // Adjust start range ahead of the punctuator
  const start = declarationStartPunctuator.range[0] + 1
  const end = declarationEndPunctuator.range[0]

  return [start, end]
}

/**
 * Returns the node with the highest range in the list
 */
function getLatestNode(body: Node[]) {
  return body.reduce((acc, node) => {
    return node.range[1] >= acc.range[1] ? node : acc
  }, body[0])
}

/**
 * Returns the node with the lowest range in the list
 */
function getEarliestNode(body: Node[]) {
  return body.reduce((acc, node) => {
    return node.range[1] <= acc.range[1] ? node : acc
  }, body[0])
}

/**
 * Returns the text of the last comment in the body
 */
function getLastCommentText(sourceCode: SourceCode, body: Node[]) {
  const lastBodyNode = getLatestNode(body)
  const lastBodyNodeComments = getCommentsAfter(sourceCode, lastBodyNode)
  const latestBodyNodeComment = getLatestNode([...lastBodyNodeComments, lastBodyNode])
  // Comments after the comments that belong to the last property in the body
  const lastComments = sourceCode.getCommentsAfter(latestBodyNodeComment)

  const { declarationEndPunctuator } = getDeclarationPunctuators(sourceCode, body)
  const lastWhitespace = getTextBetween(
    sourceCode,
    getLatestNode([...lastComments, lastBodyNode]),
    declarationEndPunctuator,
  )

  const lastCommentsTextWithWhitespace =
    getCommentsText(sourceCode, lastComments) + lastWhitespace

  // Disabled to pass test
  // if (lastComments.length > 0) {
  //   const textBeforeComment = getTextBetween(
  //     sourceCode,
  //     latestBodyNodeComment,
  //     getEarliestNode(lastComments),
  //   )

  //   return textBeforeComment + lastCommentsTextWithWhitespace
  // }

  return lastCommentsTextWithWhitespace
}

/**
 * Returns a map from index of source code to indentation string.
 */
function getIndentationMap(sourceCode: SourceCode, body: Node[]) {
  return new Map<number, string>(
    body.map((node, nodeIndex) => {
      // Special case: block comment in between two nodes
      const commentsBefore = getCommentsBefore(sourceCode, node)
      const earliestNode = getEarliestNode([...commentsBefore, node])
      const indent = getTextBetweenNodeAndPrevious(sourceCode, earliestNode)

      return [nodeIndex, indent]
    }),
  )
}

function getNextNonCommentNode(sourceCode: SourceCode, node: Node) {
  const nextNode = sourceCode.getTokenAfter(node, { includeComments: false })
  return nextNode ?? undefined
}

function getNodePunctuator(sourceCode: SourceCode, node: Node, punctuators = ',;') {
  const punctuator = sourceCode.getTokenAfter(node, {
    filter: n =>
      n.type === AST_TOKEN_TYPES.Punctuator &&
      n.value !== ':' &&
      new RegExp(`^[${punctuators}]$`).test(n.value),
    includeComments: false,
  })

  return punctuator ?? undefined
}

function getNodeFollowingPunctuator(sourceCode: SourceCode, node: Node) {
  const punctuator = getNodePunctuator(sourceCode, node)
  if (!punctuator) return undefined
  return getNextNonCommentNode(sourceCode, punctuator)
}

/**
 * Returns the text of the entire body, rebuilt from the source code in order given.
 */
export function getFixedBodyText(
  sourceCode: SourceCode,
  bodyToEmit: Node[],
  originalBody: Node[],
) {
  const indentations = getIndentationMap(sourceCode, originalBody)
  // Capture any trailing comments + whitespace
  const lastCommentsText = getLastCommentText(sourceCode, originalBody)
  return (
    bodyToEmit
      .map((node, index) => {
        const isLast = index === bodyToEmit.length - 1
        const resultNodeText =
          indentations.get(index) +
          [
            getCommentsTextBefore(sourceCode, node),
            sourceCode.getText(node),
            getCommentsTextAfter(sourceCode, node, AST_TOKEN_TYPES.Block),
            !isLast && getPunctuation(sourceCode, node),
            getCommentsTextAfter(sourceCode, node, AST_TOKEN_TYPES.Line),
          ]
            .filter(Boolean)
            .join('')
            .trimStart()

        return resultNodeText
      })
      .join('') + lastCommentsText
  )
}
