const memo: Record<string, any> = {}

// Getting strange test failures? Could be this! Disable and try again.
export function memoize(key: string, value: any): any {
  if (hasMemoized(key)) {
    return memo[key]
  }
  memo[key] = value
  return value
}

export function getMemoized(key: string): any {
  return memo[key]
}

export function hasMemoized(key: string): boolean {
  return !!memo[key]
}
