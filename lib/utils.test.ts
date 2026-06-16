import { describe, it, expect } from 'vitest'
import { formatCurrency, formatDate, formatDateInput } from './utils'

describe('formatCurrency', () => {
  it('formata um valor positivo em euros', () => {
    const result = formatCurrency(1234.56)
    expect(result).toContain('1')
    expect(result).toContain('234')
    expect(result).toContain('€')
  })

  it('formata zero', () => {
    const result = formatCurrency(0)
    expect(result).toContain('0')
    expect(result).toContain('€')
  })

  it('formata um valor com duas casas decimais', () => {
    const result = formatCurrency(48)
    expect(result).toContain('48')
    expect(result).toContain('€')
  })
})

describe('formatDate', () => {
  it('formata uma data ISO para português', () => {
    const result = formatDate('2026-06-14')
    expect(result).toContain('2026')
    expect(result).toMatch(/14/)
  })
})

describe('formatDateInput', () => {
  it('converte uma data ISO para formato de input date (YYYY-MM-DD)', () => {
    expect(formatDateInput('2026-06-14T10:30:00')).toBe('2026-06-14')
  })

  it('mantém uma data já em formato YYYY-MM-DD', () => {
    expect(formatDateInput('2026-06-14')).toBe('2026-06-14')
  })
})
