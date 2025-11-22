import { normalizeString } from '../../src/utils/stringUtils';

describe('normalizeString', () => {
  it('deve remover acentos e converter para minúsculas', () => {
    expect(normalizeString('Café')).toBe('cafe');
    expect(normalizeString('AÇÃO')).toBe('acao');
    expect(normalizeString('José')).toBe('jose');
    expect(normalizeString('São Paulo')).toBe('sao paulo');
  });

  it('deve retornar string vazia para entrada vazia', () => {
    expect(normalizeString('')).toBe('');
  });

  it('deve manter números e caracteres especiais', () => {
    expect(normalizeString('Produto 123')).toBe('produto 123');
    expect(normalizeString('Item #1')).toBe('item #1');
    expect(normalizeString('Preço: R$ 10,50')).toBe('preco: r$ 10,50');
  });

  it('deve normalizar strings com múltiplos acentos', () => {
    expect(normalizeString('Açúcar')).toBe('acucar');
    expect(normalizeString('Mamão')).toBe('mamao');
    expect(normalizeString('Coração')).toBe('coracao');
  });

  it('deve normalizar strings já sem acentos', () => {
    expect(normalizeString('PRODUTO')).toBe('produto');
    expect(normalizeString('Produto')).toBe('produto');
    expect(normalizeString('produto')).toBe('produto');
  });

  it('deve normalizar strings com espaços', () => {
    expect(normalizeString('Produto Teste')).toBe('produto teste');
    expect(normalizeString('  Espaços  ')).toBe('  espacos  ');
  });
});

