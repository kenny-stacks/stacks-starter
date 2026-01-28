import { describe, it, expect } from 'vitest'

describe('Example Test Suite', () => {
  it('should pass a basic assertion', () => {
    expect(1 + 1).toBe(2)
  })

  it('should demonstrate Vitest works with the project', () => {
    const greeting = 'Hello Stacks'
    expect(greeting).toContain('Stacks')
  })
})
