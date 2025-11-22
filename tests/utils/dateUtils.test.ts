import { formatDate, formatDateTime, getRelativeTime } from '../../src/utils/dateUtils';

describe('formatDate', () => {
  it('deve formatar data no formato DD/MM/YYYY', () => {
    const result = formatDate('2024-01-15T10:30:00Z');
    expect(result).toBe('15/01/2024');
  });

  it('deve formatar data com zero à esquerda', () => {
    const result = formatDate('2024-01-05T10:30:00Z');
    expect(result).toBe('05/01/2024');
  });

  it('deve formatar data com mês e dia com zero à esquerda', () => {
    const result = formatDate('2024-03-09T10:30:00Z');
    expect(result).toBe('09/03/2024');
  });

  it('deve formatar diferentes datas corretamente', () => {
    expect(formatDate('2023-12-31T23:59:59Z')).toBe('31/12/2023');
    const result = formatDate('2024-02-28T12:00:00Z');
    expect(result).toMatch(/^\d{2}\/02\/2024$/);
  });
});

describe('formatDateTime', () => {
  it('deve formatar data e hora corretamente', () => {
    const result = formatDateTime('2024-01-15T14:30:00Z');
    expect(result).toContain('15/01/2024');
    expect(result).toContain('às');
    expect(result).toMatch(/\d{2}:\d{2}/);
  });

  it('deve formatar hora com zero à esquerda', () => {
    const date = new Date('2024-01-15T09:05:00Z');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const expected = `${hours}:${minutes}`;
    const result = formatDateTime('2024-01-15T09:05:00Z');
    expect(result).toContain(expected);
  });

  it('deve formatar meia-noite corretamente', () => {
    const date = new Date('2024-01-15T00:00:00Z');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const expected = `${hours}:${minutes}`;
    const result = formatDateTime('2024-01-15T00:00:00Z');
    expect(result).toContain(expected);
  });

  it('deve formatar diferentes horários corretamente', () => {
    const date1 = new Date('2024-01-15T23:59:00Z');
    const hours1 = date1.getHours().toString().padStart(2, '0');
    const minutes1 = date1.getMinutes().toString().padStart(2, '0');
    const expected1 = `${hours1}:${minutes1}`;
    const result1 = formatDateTime('2024-01-15T23:59:00Z');
    expect(result1).toContain(expected1);
    
    const date2 = new Date('2024-01-15T12:30:00Z');
    const hours2 = date2.getHours().toString().padStart(2, '0');
    const minutes2 = date2.getMinutes().toString().padStart(2, '0');
    const expected2 = `${hours2}:${minutes2}`;
    const result2 = formatDateTime('2024-01-15T12:30:00Z');
    expect(result2).toContain(expected2);
  });
});

describe('getRelativeTime', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('deve retornar "agora" para menos de 60 segundos', () => {
    const now = new Date('2024-01-15T12:00:00Z');
    jest.setSystemTime(now);
    
    const date = new Date('2024-01-15T11:59:30Z');
    expect(getRelativeTime(date.toISOString())).toBe('agora');
  });

  it('deve retornar minutos corretamente', () => {
    const now = new Date('2024-01-15T12:00:00Z');
    jest.setSystemTime(now);
    
    const date1 = new Date('2024-01-15T11:55:00Z');
    expect(getRelativeTime(date1.toISOString())).toBe('há 5 minutos');
    
    const date2 = new Date('2024-01-15T11:59:00Z');
    expect(getRelativeTime(date2.toISOString())).toBe('há 1 minuto');
  });

  it('deve retornar horas corretamente', () => {
    const now = new Date('2024-01-15T12:00:00Z');
    jest.setSystemTime(now);
    
    const date1 = new Date('2024-01-15T10:00:00Z');
    expect(getRelativeTime(date1.toISOString())).toBe('há 2 horas');
    
    const date2 = new Date('2024-01-15T11:00:00Z');
    expect(getRelativeTime(date2.toISOString())).toBe('há 1 hora');
  });

  it('deve retornar dias corretamente', () => {
    const now = new Date('2024-01-15T12:00:00Z');
    jest.setSystemTime(now);
    
    const date1 = new Date('2024-01-12T12:00:00Z');
    expect(getRelativeTime(date1.toISOString())).toBe('há 3 dias');
    
    const date2 = new Date('2024-01-14T12:00:00Z');
    expect(getRelativeTime(date2.toISOString())).toBe('há 1 dia');
  });

  it('deve retornar meses corretamente', () => {
    const now = new Date('2024-03-15T12:00:00Z');
    jest.setSystemTime(now);
    
    const date1 = new Date('2024-01-15T12:00:00Z');
    expect(getRelativeTime(date1.toISOString())).toBe('há 2 meses');
    
    const date2 = new Date('2024-02-01T12:00:00Z');
    expect(getRelativeTime(date2.toISOString())).toBe('há 1 mês');
  });

  it('deve retornar anos corretamente', () => {
    const now = new Date('2024-01-15T12:00:00Z');
    jest.setSystemTime(now);
    
    const date1 = new Date('2022-01-15T12:00:00Z');
    expect(getRelativeTime(date1.toISOString())).toBe('há 2 anos');
    
    const date2 = new Date('2023-01-15T12:00:00Z');
    expect(getRelativeTime(date2.toISOString())).toBe('há 1 ano');
  });

  it('deve usar plural corretamente', () => {
    const now = new Date('2024-01-15T12:00:00Z');
    jest.setSystemTime(now);
    
    const date1 = new Date('2024-01-15T11:58:00Z');
    expect(getRelativeTime(date1.toISOString())).toBe('há 2 minutos');
    
    const date2 = new Date('2024-01-15T10:00:00Z');
    expect(getRelativeTime(date2.toISOString())).toBe('há 2 horas');
    
    const date3 = new Date('2024-01-13T12:00:00Z');
    expect(getRelativeTime(date3.toISOString())).toBe('há 2 dias');
  });
});

