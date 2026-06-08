import { describe, it, expect } from 'vitest'
import { capitalize } from './capitalize'

describe('capitalize', () => {
  it('uppercases the first character of a normal word', () => {
    expect(capitalize('hello')).toBe('Hello')
  })

  it('leaves already-capitalized word unchanged', () => {
    expect(capitalize('Hello')).toBe('Hello')
  })

  it('returns empty string for empty input', () => {
    expect(capitalize('')).toBe('')
  })

  it('handles single character', () => {
    expect(capitalize('a')).toBe('A')
    expect(capitalize('A')).toBe('A')
  })
})
