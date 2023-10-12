import { loremIpsum } from 'lorem-ipsum'
import { Range, WhitespaceTypes } from './types'

export const range = (min: number, max: number) => [min, max] as Range

export const capitalize = (str: string) => str[0].toUpperCase() + str.slice(1)

export function randomSelect<T>(arr: T[] | object): T {
  if (Array.isArray(arr)) return arr[Math.floor(Math.random() * arr.length)]
  return randomSelect(Object.values(arr))
}

export function randomIntBetween([min, max]: Range) {
  if (min > max) return randomIntBetween([0, max])
  return Math.floor(Math.random() * (max - min + 1) + min)
}

// Generates lorem ipsum text
export function randomText(
  countRange: Range,
  units: 'words' | 'sentences' | 'paragraphs',
) {
  console.log(countRange, units)
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
  const arr = Array.from({ length }, generator)
  arr.forEach((_, index) => {
    if (arr.indexOf(_) !== index && arr.indexOf(_, index) !== -1) {
      arr[index] = generator()
    }
  })
  return arr
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
