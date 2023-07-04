import { ReportFixFunction } from '@typescript-eslint/utils/dist/ts-eslint'
import { AllRuleOptions, CreateReporterArgs, SourceCode, TSType } from './types'
import { getDeclarationPunctuators, getFixedBodyText } from './utils/sourceCodeHelper'

import { TSESLint } from '@typescript-eslint/utils'

export const getFixerFunction = (
  createReporterArgs: Pick<CreateReporterArgs<string, AllRuleOptions>, 'context'>,
  body: TSType[],
  sortedBody: TSType[],
): ReportFixFunction =>
  function* (fixer: TSESLint.RuleFixer) {
    // Replace the entire body with the sorted body
    const sourceCode = createReporterArgs.context.getSourceCode() as SourceCode

    const { declarationStartPunctuator, declarationEndPunctuator } =
      getDeclarationPunctuators(sourceCode, body)
    // Adjust the start range ahead of the punctuator
    const start = declarationStartPunctuator.range[0] + 1
    const end = declarationEndPunctuator.range[0]

    const fixedBodyText = getFixedBodyText(sourceCode, sortedBody, body)
    yield fixer.replaceTextRange([start, end], fixedBodyText)
  }
