import { calculateDistanceInKm, formatDistance } from '../../src/utils/distance';

describe('calculateDistanceInKm', () => {
  it('deve calcular distância entre duas coordenadas válidas', () => {
    const lat1 = -23.5505;
    const lon1 = -46.6333;
    const lat2 = -23.5632;
    const lon2 = -46.6542;

    const distance = calculateDistanceInKm(lat1, lon1, lat2, lon2);

    expect(distance).toBeGreaterThan(0);
    expect(distance).toBeLessThan(10);
    expect(typeof distance).toBe('number');
  });

  it('deve retornar 0 para coordenadas idênticas', () => {
    const lat = -23.5505;
    const lon = -46.6333;

    const distance = calculateDistanceInKm(lat, lon, lat, lon);

    expect(distance).toBe(0);
  });

  it('deve retornar NaN para latitude inválida (maior que 90)', () => {
    const distance = calculateDistanceInKm(91, -46.6333, -23.5505, -46.6333);
    expect(Number.isNaN(distance)).toBe(true);
  });

  it('deve retornar NaN para latitude inválida (menor que -90)', () => {
    const distance = calculateDistanceInKm(-91, -46.6333, -23.5505, -46.6333);
    expect(Number.isNaN(distance)).toBe(true);
  });

  it('deve retornar NaN para longitude inválida (maior que 180)', () => {
    const distance = calculateDistanceInKm(-23.5505, 181, -23.5505, -46.6333);
    expect(Number.isNaN(distance)).toBe(true);
  });

  it('deve retornar NaN para longitude inválida (menor que -180)', () => {
    const distance = calculateDistanceInKm(-23.5505, -181, -23.5505, -46.6333);
    expect(Number.isNaN(distance)).toBe(true);
  });

  it('deve retornar NaN para latitude NaN', () => {
    const distance = calculateDistanceInKm(NaN, -46.6333, -23.5505, -46.6333);
    expect(Number.isNaN(distance)).toBe(true);
  });

  it('deve retornar NaN para longitude NaN', () => {
    const distance = calculateDistanceInKm(-23.5505, NaN, -23.5505, -46.6333);
    expect(Number.isNaN(distance)).toBe(true);
  });

  it('deve retornar NaN para Infinity', () => {
    const distance = calculateDistanceInKm(Infinity, -46.6333, -23.5505, -46.6333);
    expect(Number.isNaN(distance)).toBe(true);
  });

  it('deve calcular distância entre São Paulo e Rio de Janeiro', () => {
    const spLat = -23.5505;
    const spLon = -46.6333;
    const rjLat = -22.9068;
    const rjLon = -43.1729;

    const distance = calculateDistanceInKm(spLat, spLon, rjLat, rjLon);

    expect(distance).toBeGreaterThan(300);
    expect(distance).toBeLessThan(400);
  });

  it('deve retornar valor com 2 casas decimais', () => {
    const lat1 = -23.5505;
    const lon1 = -46.6333;
    const lat2 = -23.5510;
    const lon2 = -46.6340;

    const distance = calculateDistanceInKm(lat1, lon1, lat2, lon2);

    const decimalPlaces = (distance.toString().split('.')[1] || '').length;
    expect(decimalPlaces).toBeLessThanOrEqual(2);
  });

  it('deve calcular distância cruzando o meridiano', () => {
    const lat1 = -23.5505;
    const lon1 = 179;
    const lat2 = -23.5505;
    const lon2 = -179;

    const distance = calculateDistanceInKm(lat1, lon1, lat2, lon2);

    expect(distance).toBeGreaterThan(0);
  });

  it('deve calcular distância no equador', () => {
    const lat1 = 0;
    const lon1 = -46.6333;
    const lat2 = 0;
    const lon2 = -46.6343;

    const distance = calculateDistanceInKm(lat1, lon1, lat2, lon2);

    expect(distance).toBeGreaterThan(0);
  });
});

describe('formatDistance', () => {
  it('deve formatar distância em km quando maior que 1km', () => {
    expect(formatDistance(5.5)).toBe('5.5 km');
  });

  it('deve formatar distância em metros quando menor que 1km', () => {
    expect(formatDistance(0.5)).toBe('500 m');
  });

  it('deve formatar distância exatamente 1km', () => {
    expect(formatDistance(1)).toBe('1.0 km');
  });

  it('deve formatar distância muito pequena', () => {
    expect(formatDistance(0.001)).toBe('1 m');
  });

  it('deve formatar distância com uma casa decimal', () => {
    expect(formatDistance(2.7)).toBe('2.7 km');
  });

  it('deve retornar null para undefined', () => {
    expect(formatDistance(undefined)).toBeNull();
  });

  it('deve retornar null para null', () => {
    expect(formatDistance(null)).toBeNull();
  });

  it('deve retornar null para NaN', () => {
    expect(formatDistance(NaN)).toBeNull();
  });

  it('deve arredondar metros para inteiro', () => {
    expect(formatDistance(0.123)).toBe('123 m');
  });

  it('deve formatar distância zero em metros', () => {
    expect(formatDistance(0)).toBe('0 m');
  });

  it('deve formatar distância grande', () => {
    expect(formatDistance(100.5)).toBe('100.5 km');
  });

  it('deve arredondar metros corretamente', () => {
    expect(formatDistance(0.999)).toBe('999 m');
  });

  it('deve formatar distância próxima de 1km', () => {
    expect(formatDistance(0.95)).toBe('950 m');
  });
});

