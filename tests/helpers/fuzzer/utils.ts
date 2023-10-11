import { loremIpsum } from 'lorem-ipsum'
import { Range, WhitespaceTypes } from './types'

export const range = (min: number, max: number) => [min, max] as Range

export const capitalize = (str: string) => str[0].toUpperCase() + str.slice(1)

export function randomSelect<T>(arr: T[] | object): T {
  if (Array.isArray(arr)) return arr[Math.floor(Math.random() * arr.length)]
  return randomSelect(Object.values(arr))
}

export function randomIntBetween([min, max]: Range) {
  return Math.floor(Math.random() * (max - min + 1) + min)
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
    paragraphLowerBound: 2, // Min sentences per paragraph
    paragraphUpperBound: 3, // Max sentences per paragarph
    sentenceLowerBound: 3, // Min words per sentence
    sentenceUpperBound: 4, // Max words per sentence
  })
}

export function generateFilledArray<T>(length: number, generator: () => T): Array<T> {
  return Array.from({ length }, generator)
}

const validCharacters =
  'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_.' +
  'áéíóúÀÈÌÒÙâêîôûÄËÏÖÜãñõçÇß' +
  '€£¥¢§®©¶@#%&+!-/*\\?<>'
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
