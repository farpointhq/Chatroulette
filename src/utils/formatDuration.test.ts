import { describe, it, expect } from 'vitest'
import { formatDuration } from './formatDuration'

describe('formatDuration', () => {
  it('formats 0 as "0:00"', () => {
    expect(formatDuration(0)).toBe('0:00')
  })

  it('formats less than 60 seconds correctly', () => {
    expect(formatDuration(45)).toBe('0:45')
  })

  it('formats exactly 60 seconds as "1:00"', () => {
    expect(formatDuration(60)).toBe('1:00')
  })

  it('formats greater than 600 seconds correctly', () => {
    expect(formatDuration(600)).toBe('10:00')
  })

  it('formats 65 seconds as "1:05"', () => {
    expect(formatDuration(65)).toBe('1:05')
  })

  it('clamps negative input to "0:00"', () => {
    expect(formatDuration(-10)).toBe('0:00')
  })
})
