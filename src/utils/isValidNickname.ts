export function isValidNickname(input: string): boolean {
  return /^[A-Za-z0-9_]{3,16}$/.test(input)
}
