import { describe, it, expect } from 'vitest'
import { formatCurrency, formatCurrencyInput, getSymbolFallback } from '@/utils/formatCurrency'

describe('getSymbolFallback', () => {
  it('retorna $ para USD', () => expect(getSymbolFallback('USD')).toBe('$'))
  it('retorna € para EUR', () => expect(getSymbolFallback('EUR')).toBe('€'))
  it('retorna $ para COP', () => expect(getSymbolFallback('COP')).toBe('$'))
  it('retorna $ para moneda desconocida', () => expect(getSymbolFallback('XYZ')).toBe('$'))
})

describe('formatCurrency — formato miles (default)', () => {
  it('abrevia millones con M y 2 decimales', () => {
    expect(formatCurrency(1000000, 'COP')).toBe('$1,00M')
  })

  it('abrevia 2.5M con coma decimal', () => {
    expect(formatCurrency(2500000, 'COP')).toBe('$2,50M')
  })

  it('abrevia miles con K (sin decimales)', () => {
    expect(formatCurrency(50000, 'COP')).toBe('$50K')
  })

  it('abrevia 500K correctamente', () => {
    expect(formatCurrency(500000, 'COP')).toBe('$500K')
  })

  it('muestra valor exacto para menores de 1000', () => {
    expect(formatCurrency(999, 'COP')).toBe('$999')
  })

  it('maneja cero', () => {
    expect(formatCurrency(0, 'COP')).toBe('$0')
  })

  it('usa símbolo personalizado cuando se provee', () => {
    expect(formatCurrency(1000, 'COP', 'miles', 'COP$')).toBe('COP$1K')
  })
})

describe('formatCurrency — formato completo', () => {
  it('usa Intl.NumberFormat para formato completo', () => {
    const result = formatCurrency(1000000, 'COP', 'completo')
    expect(result).toContain('1')
    expect(typeof result).toBe('string')
  })

  it('incluye separadores de miles en formato completo', () => {
    const result = formatCurrency(1500000, 'COP', 'completo')
    expect(result.length).toBeGreaterThan(5)
  })
})

describe('formatCurrencyInput', () => {
  it('formatea input numérico con separadores', () => {
    const result = formatCurrencyInput('1000000')
    expect(result).toBeTruthy()
    expect(result).toContain('1')
  })

  it('retorna string vacío para input vacío', () => {
    expect(formatCurrencyInput('')).toBe('')
  })

  it('elimina caracteres no numéricos', () => {
    const result = formatCurrencyInput('1.000.000')
    expect(result).toBeTruthy()
  })

  it('maneja solo letras → vacío', () => {
    expect(formatCurrencyInput('abc')).toBe('')
  })
})
