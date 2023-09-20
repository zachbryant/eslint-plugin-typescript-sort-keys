const memo: Record<string, any> = {}

export function memoize(key: string, value: any): any {
  if (memo[key]) {
    return memo[key]
  }
  memo[key] = value
  return value
}

export function getMemoized(key: string): any {
  return memo[key]
}
