import { describe, it, expect } from 'vitest'
import { isValidNickname } from './isValidNickname'

describe('isValidNickname', () => {
  it('returns true for valid mid-length nickname', () => {
    expect(isValidNickname('Player_1')).toBe(true)
  })

  it('returns false for too short (≤2 chars)', () => {
    expect(isValidNickname('ab')).toBe(false)
    expect(isValidNickname('a')).toBe(false)
    expect(isValidNickname('')).toBe(false)
  })

  it('returns false for too long (≥17 chars)', () => {
    expect(isValidNickname('a'.repeat(17))).toBe(false)
  })

  it('returns false for invalid characters (space)', () => {
    expect(isValidNickname('Player One')).toBe(false)
  })

  it('returns false for invalid characters (symbol)', () => {
    expect(isValidNickname('Player@1')).toBe(false)
    expect(isValidNickname('Player-1')).toBe(false)
  })

  it('returns true for exactly 3 chars', () => {
    expect(isValidNickname('abc')).toBe(true)
  })

  it('returns true for exactly 16 chars', () => {
    expect(isValidNickname('a'.repeat(16))).toBe(true)
  })

  it('allows underscores', () => {
    expect(isValidNickname('_user_name_')).toBe(true)
  })

  it('allows digits', () => {
    expect(isValidNickname('user123')).toBe(true)
  })
})
