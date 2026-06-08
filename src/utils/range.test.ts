import { describe, it, expect } from 'vitest'
import { range } from './range'

describe('range', () => {
  it('returns integers from start (inclusive) to end (exclusive)', () => {
    expect(range(0, 5)).toEqual([0, 1, 2, 3, 4])
  })

  it('returns empty array when start equals end', () => {
    expect(range(3, 3)).toEqual([])
  })

  it('returns empty array when start is greater than end', () => {
    expect(range(5, 0)).toEqual([])
  })

  it('handles negative ranges correctly', () => {
    expect(range(-2, 2)).toEqual([-2, -1, 0, 1])
  })
})
