export function range(start: number, end: number): number[] {
  if (start >= end) return []
  const result: number[] = []
  for (let i = start; i < end; i++) {
    result.push(i)
  }
  return result
}
