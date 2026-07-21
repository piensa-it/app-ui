import { describe, it, expect } from 'vitest'
import { humanizeAuditAction } from '@/utils/auditLog'

describe('humanizeAuditAction — acciones conocidas (P4-19)', () => {
  it('traduce eventos de transacciones', () => {
    expect(humanizeAuditAction('transaction_created')).toBe('Transacción creada')
    expect(humanizeAuditAction('transaction_updated')).toBe('Transacción editada')
    expect(humanizeAuditAction('transaction_deleted')).toBe('Transacción eliminada')
    expect(humanizeAuditAction('transfer_created')).toBe('Transferencia registrada')
  })

  it('traduce eventos de cuentas y presupuestos', () => {
    expect(humanizeAuditAction('account_created')).toBe('Cuenta o medio de pago creado')
    expect(humanizeAuditAction('budget_deleted')).toBe('Presupuesto eliminado')
  })

  it('traduce eventos de correo ya existentes', () => {
    expect(humanizeAuditAction('email_suggestion_confirmed')).toBe(
      'Sugerencia de correo confirmada como transacción'
    )
  })
})

describe('humanizeAuditAction — acciones desconocidas', () => {
  it('humaniza un código futuro sin romper (guiones bajos → espacios, capitaliza)', () => {
    expect(humanizeAuditAction('some_future_event')).toBe('Some future event')
  })
})
