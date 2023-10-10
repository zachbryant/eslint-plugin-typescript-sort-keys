export enum ErrorMessage {
  InterfaceParentInvalidOrder = `Found {{ unsortedCount }} keys out of order.`,
  StringEnumParentInvalidOrder = `Found {{ unsortedCount }} members out of order.`,
  InterfaceInvalidOrder = `Expected interface keys to be in {{ requiredFirst }}{{ insensitive }}{{ natural }}{{ order }}ending order. '{{ nodeName }}' should be {{ messageShouldBeWhere }}. Run autofix to sort entire body.`,
  StringEnumInvalidOrder = `Expected string enum members to be in {{ insensitive }}{{ natural }}{{ order }}ending order. '{{ nodeName }}' should be {{ messageShouldBeWhere }}. Run autofix to sort entire body.`,
}
