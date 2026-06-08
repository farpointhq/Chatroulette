export function capitalize(input: string): string {
  if (input.length === 0) return ''
  return input[0].toUpperCase() + input.slice(1)
}
