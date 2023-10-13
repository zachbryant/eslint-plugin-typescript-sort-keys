import { loremIpsum } from 'lorem-ipsum'
import os from 'os'
import path from 'path'
import * as ts from 'typescript'
import { Range, WhitespaceTypes } from './types'

export const range = (min: number, max: number) => [min, max] as Range

export const capitalize = (str: string) => str[0].toUpperCase() + str.slice(1)

export function randomSelect<T>(arr: T[] | object): T {
  if (Array.isArray(arr)) return arr[Math.floor(Math.random() * arr.length)]
  return randomSelect(Object.values(arr))
}

// Returns a random integer between min and max, inclusive
export function randomIntBetween([min, max]: Range) {
  return Math.abs(Math.floor(Math.random() * (max - min + 1) + min))
}

// Generates lorem ipsum text
export function randomText(
  countRange: Range,
  units: 'words' | 'sentences' | 'paragraphs',
) {
  return loremIpsum({
    count: randomIntBetween(countRange),
    random: Math.random,
    format: 'plain',
    units,
    paragraphLowerBound: 1, // Min sentences per paragraph
    paragraphUpperBound: 2, // Max sentences per paragarph
    sentenceLowerBound: 3, // Min words per sentence
    sentenceUpperBound: 4, // Max words per sentence
  })
}

export function generateFilledArray<T>(length: number, generator: () => T): Array<T> {
  const arr = new Array(length)
  for (let index = 0; index < length; index++) {
    let generated
    while (arr.includes((generated = generator()))) {
      /**/
    }
    arr[index] = generated
  }
  return arr
}

const validCharacters =
  'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_.' +
  'áéíóúÄËÏÖÜçÇß' +
  '£®¶@#%&+!-/*\\?<>'
export function generateRandomMemberKeyCharacter(): string {
  const randomIndex = Math.floor(Math.random() * validCharacters.length)
  return validCharacters[randomIndex]
}

export function generateRandomMemberKeyName(): string {
  return generateFilledArray(
    randomIntBetween(range(1, 4)),
    generateRandomMemberKeyCharacter,
  ).join('')
}

export const getWhitespaceFromType = (spaceType: WhitespaceTypes) => {
  switch (spaceType) {
    case WhitespaceTypes.Newline:
      return '\n'
    case WhitespaceTypes.Space:
      return ' '
    case WhitespaceTypes.Tab:
      return '\t'
  }
}

// [a,b,c,d] zipped with [1,2,] -> [a,1,b,2,c,d]
export const zip = <T = unknown, U = unknown>(
  arr1: Array<T>,
  arr2: Array<U>,
): Array<T | U> => {
  const result: Array<T | U> = []
  for (let index = 0; index < Math.max(arr1.length, arr2.length); index++) {
    if (arr1[index]) result.push(arr1[index])
    if (arr2[index]) result.push(arr2[index])
  }
  return result
}

export function chance(probability: number) {
  return Math.random() < probability
}

export function validateTSCode(code: string): boolean {
  console.log(code)
  const tempFilePath = path.resolve(
    os.tmpdir(),
    `temp_${new Date().getMilliseconds()}.ts`,
  )
  const sourceFile = ts.createSourceFile(tempFilePath, code, ts.ScriptTarget.Latest, true)

  const program = ts.createProgram({
    rootNames: [tempFilePath],
    options: {
      module: ts.ModuleKind.ESNext,
      skipLibCheck: true,
      strict: true,
    },
  })

  try {
    const errors = ts
      .getPreEmitDiagnostics(program, sourceFile)
      .filter(_ => _.category === ts.DiagnosticCategory.Error)
    errors.forEach(console.log)

    return errors.length === 0
  } catch (error) {
    console.error(error)
    return false
  }
}
