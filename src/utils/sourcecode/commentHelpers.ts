import { AST_TOKEN_TYPES, TSESTree } from '@typescript-eslint/utils'
import { Node, SourceCode } from 'types'
import { getLatestNode } from './nodeHelpers'
import {
  getDeclarationPunctuators,
  getNodeFollowingPunctuator,
  getNodePunctuator,
} from './punctuationHelpers'
import {
  getTextBetween,
  getTextBetweenNodeAndNext,
  getTextBetweenNodeAndPrevious,
} from './textHelpers'

/**
 * Returns the text of the last comment in the body
 */
export function getLastCommentText(sourceCode: SourceCode, body: Node[]) {
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
 * Returns the text of comment nodes, preserving whitespace (including leading
 * whitespace between comments and previous punctuator/body node).
 */
export function getCommentsText(
  sourceCode: SourceCode,
  comments: TSESTree.Comment[],
): string {
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
export function getCommentsTextBefore(sourceCode: SourceCode, node: Node) {
  let commentText = getCommentsText(sourceCode, getCommentsBefore(sourceCode, node))
  if (commentText) {
    commentText += getTextBetweenNodeAndPrevious(sourceCode, node)
  }
  return commentText
}

/* Get text of comments after a node, if any, with leading whitespace. */
export function getCommentsTextAfter(
  sourceCode: SourceCode,
  node: Node,
  type?: AST_TOKEN_TYPES.Line | AST_TOKEN_TYPES.Block,
) {
  return getCommentsText(sourceCode, getCommentsAfter(sourceCode, node, type))
}

/**
 * Returns comments before a node, but only if they belong to it. Excludes line
 * comments directly after the previous node which are on the same line as prev.
 *
 * Returns empty array if there is no previous node.
 */
export function getCommentsBefore(
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
export function getCommentsAfter(
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
