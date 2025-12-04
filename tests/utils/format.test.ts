import {
  formatCurrency,
  formatOrderDate,
  formatCardNumber,
  formatExpiryDate,
  formatPhone,
} from '../../src/utils/format';

describe('formatCurrency', () => {
  it('deve formatar valor positivo', () => {
    expect(formatCurrency(10.50)).toBe('R$ 10,50');
  });

  it('deve formatar valor com zero', () => {
    expect(formatCurrency(0)).toBe('R$ 0,00');
  });

  it('deve formatar valor negativo', () => {
    expect(formatCurrency(-5.75)).toBe('R$ -5,75');
  });

  it('deve formatar valor inteiro', () => {
    expect(formatCurrency(100)).toBe('R$ 100,00');
  });

  it('deve formatar valor com muitos decimais', () => {
    expect(formatCurrency(10.999)).toBe('R$ 11,00');
  });

  it('deve retornar R$ 0,00 para Infinity', () => {
    expect(formatCurrency(Infinity)).toBe('R$ 0,00');
  });

  it('deve retornar R$ 0,00 para -Infinity', () => {
    expect(formatCurrency(-Infinity)).toBe('R$ 0,00');
  });

  it('deve retornar R$ 0,00 para NaN', () => {
    expect(formatCurrency(NaN)).toBe('R$ 0,00');
  });

  it('deve formatar valor grande', () => {
    expect(formatCurrency(9999.99)).toBe('R$ 9999,99');
  });

  it('deve formatar valor muito pequeno', () => {
    expect(formatCurrency(0.01)).toBe('R$ 0,01');
  });
});

describe('formatOrderDate', () => {
  it('deve formatar data como string ISO', () => {
    const dateString = '2024-01-15T14:30:00Z';
    const result = formatOrderDate(dateString);
    expect(result).toContain('15/01/2024');
    expect(result).toMatch(/\d{2}:\d{2}/);
  });

  it('deve formatar data como objeto Date', () => {
    const date = new Date('2024-03-20T10:15:00Z');
    const result = formatOrderDate(date);
    expect(result).toContain('20/03/2024');
  });

  it('deve retornar "Data inválida" para string inválida', () => {
    expect(formatOrderDate('data-invalida')).toBe('Data inválida');
  });

  it('deve retornar "Data inválida" para Date inválido', () => {
    const invalidDate = new Date('invalid');
    expect(formatOrderDate(invalidDate)).toBe('Data inválida');
  });

  it('deve formatar data com zero à esquerda', () => {
    const date = new Date('2024-01-05T09:05:00Z');
    const result = formatOrderDate(date);
    expect(result).toContain('05/01/2024');
  });

  it('deve incluir hora e minuto', () => {
    const date = new Date('2024-01-15T14:30:00Z');
    const result = formatOrderDate(date);
    expect(result).toMatch(/\d{2}:\d{2}/);
  });
});

describe('formatCardNumber', () => {
  it('deve formatar número de cartão completo', () => {
    expect(formatCardNumber('1234567812345678')).toBe('1234 5678 1234 5678');
  });

  it('deve formatar número de cartão parcial', () => {
    expect(formatCardNumber('12345678')).toBe('1234 5678');
  });

  it('deve remover espaços existentes', () => {
    expect(formatCardNumber('1234 5678 1234 5678')).toBe('1234 5678 1234 5678');
  });

  it('deve limitar a 19 caracteres', () => {
    const longNumber = '1234567812345678901234';
    expect(formatCardNumber(longNumber).length).toBeLessThanOrEqual(19);
  });

  it('deve retornar string vazia para entrada vazia', () => {
    expect(formatCardNumber('')).toBe('');
  });

  it('deve formatar número curto', () => {
    expect(formatCardNumber('1234')).toBe('1234');
  });

  it('deve formatar número com caracteres não numéricos', () => {
    expect(formatCardNumber('1234-5678-1234-5678')).toBe('1234 -567 8-12 34-5');
  });
});

describe('formatExpiryDate', () => {
  it('deve formatar data de expiração completa', () => {
    expect(formatExpiryDate('1225')).toBe('12/25');
  });

  it('deve formatar data de expiração parcial', () => {
    expect(formatExpiryDate('12')).toBe('12/');
  });

  it('deve remover caracteres não numéricos', () => {
    expect(formatExpiryDate('12/25')).toBe('12/25');
  });

  it('deve formatar apenas números', () => {
    expect(formatExpiryDate('abc1225def')).toBe('12/25');
  });

  it('deve retornar string vazia para entrada vazia', () => {
    expect(formatExpiryDate('')).toBe('');
  });

  it('deve formatar um dígito', () => {
    expect(formatExpiryDate('1')).toBe('1');
  });

  it('deve limitar a 4 dígitos', () => {
    expect(formatExpiryDate('122599')).toBe('12/25');
  });
});

describe('formatPhone', () => {
  it('deve formatar telefone completo', () => {
    expect(formatPhone('11999999999')).toBe('(11) 99999-9999');
  });

  it('deve formatar telefone com 10 dígitos', () => {
    expect(formatPhone('1133334444')).toBe('(11) 33334-444');
  });

  it('deve formatar telefone parcial com DDD', () => {
    expect(formatPhone('11')).toBe('(11');
  });

  it('deve formatar telefone parcial com DDD e início', () => {
    expect(formatPhone('11999')).toBe('(11) 999');
  });

  it('deve remover caracteres não numéricos', () => {
    expect(formatPhone('(11) 99999-9999')).toBe('(11) 99999-9999');
  });

  it('deve retornar string vazia para entrada vazia', () => {
    expect(formatPhone('')).toBe('');
  });

  it('deve formatar telefone com caracteres especiais', () => {
    expect(formatPhone('11-99999-9999')).toBe('(11) 99999-9999');
  });

  it('deve formatar telefone parcial sem hífen', () => {
    expect(formatPhone('1199999')).toBe('(11) 99999');
  });

  it('deve limitar a 11 dígitos', () => {
    expect(formatPhone('119999999999')).toBe('(11) 99999-9999');
  });
});

