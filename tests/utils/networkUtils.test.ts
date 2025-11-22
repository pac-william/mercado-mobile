import { isNetworkError, getNetworkErrorMessage } from '../../src/utils/networkUtils';

describe('isNetworkError', () => {
  it('deve retornar false se há resposta do servidor', () => {
    const error = { response: { status: 404 } };
    expect(isNetworkError(error)).toBe(false);
  });

  it('deve retornar false para erro null', () => {
    expect(isNetworkError(null)).toBe(false);
  });

  it('deve retornar false para erro undefined', () => {
    expect(isNetworkError(undefined)).toBe(false);
  });

  it('deve retornar true para erro sem resposta', () => {
    const error = { request: {}, isAxiosError: true };
    expect(isNetworkError(error)).toBe(true);
  });

  it('deve retornar true para erro de conexão recusada', () => {
    const error = { code: 'ECONNREFUSED', request: {} };
    expect(isNetworkError(error)).toBe(true);
  });

  it('deve retornar true para erro de timeout', () => {
    const error1 = { code: 'ECONNABORTED', request: {} };
    expect(isNetworkError(error1)).toBe(true);
    
    const error2 = { code: 'ETIMEDOUT', request: {} };
    expect(isNetworkError(error2)).toBe(true);
  });

  it('deve retornar true para ERR_NETWORK', () => {
    const error = { code: 'ERR_NETWORK', request: {} };
    expect(isNetworkError(error)).toBe(true);
  });

  it('deve retornar true para ENOTFOUND', () => {
    const error = { code: 'ENOTFOUND', request: {} };
    expect(isNetworkError(error)).toBe(true);
  });

  it('deve retornar true para ERR_INTERNET_DISCONNECTED', () => {
    const error = { code: 'ERR_INTERNET_DISCONNECTED', request: {} };
    expect(isNetworkError(error)).toBe(true);
  });

  it('deve retornar true para erro com flag isNetworkError', () => {
    const error = { isNetworkError: true };
    expect(isNetworkError(error)).toBe(true);
  });

  it('deve retornar true para erro com flag networkError', () => {
    const error = { networkError: true };
    expect(isNetworkError(error)).toBe(true);
  });

  it('deve retornar true para erro Axios sem resposta', () => {
    const error = { isAxiosError: true, request: {} };
    expect(isNetworkError(error)).toBe(true);
  });

  it('deve retornar true para erro com name AxiosError sem resposta', () => {
    const error = { name: 'AxiosError', request: {} };
    expect(isNetworkError(error)).toBe(true);
  });

  it('deve retornar true para erro com config e request sem response', () => {
    const error = { config: {}, request: {} };
    expect(isNetworkError(error)).toBe(true);
  });

  it('deve retornar true para mensagem "Network Error"', () => {
    const error = { message: 'Network Error' };
    expect(isNetworkError(error)).toBe(true);
  });

  it('deve retornar true para mensagem contendo "Network Error"', () => {
    const error = { message: 'Erro: Network Error ocorreu' };
    expect(isNetworkError(error)).toBe(true);
  });

  it('deve retornar true para mensagem contendo "timeout"', () => {
    const error = { message: 'Request timeout' };
    expect(isNetworkError(error)).toBe(true);
  });

  it('deve retornar true para "network request failed"', () => {
    const error = { message: 'network request failed' };
    expect(isNetworkError(error)).toBe(true);
  });

  it('deve retornar true para "failed to fetch"', () => {
    const error = { message: 'failed to fetch' };
    expect(isNetworkError(error)).toBe(true);
  });

  it('deve retornar true para "no internet"', () => {
    const error = { message: 'no internet connection' };
    expect(isNetworkError(error)).toBe(true);
  });

  it('deve retornar true para mensagem de connection com request', () => {
    const error = { message: 'connection error', request: {} };
    expect(isNetworkError(error)).toBe(true);
  });

  it('deve retornar true para mensagem de connection com code', () => {
    const error = { message: 'connection failed', code: 'ERR_CONN' };
    expect(isNetworkError(error)).toBe(true);
  });

  it('não deve retornar true para erro com response mesmo tendo request', () => {
    const error = { request: {}, response: { status: 500 } };
    expect(isNetworkError(error)).toBe(false);
  });

  it('não deve retornar true para timeout com response', () => {
    const error = { code: 'ETIMEDOUT', response: { status: 408 } };
    expect(isNetworkError(error)).toBe(false);
  });
});

describe('getNetworkErrorMessage', () => {
  it('deve retornar mensagem amigável', () => {
    const message = getNetworkErrorMessage();
    expect(message).toBe('Sem conexão com a internet. Verifique sua conexão e tente novamente.');
  });

  it('deve sempre retornar a mesma mensagem', () => {
    const message1 = getNetworkErrorMessage();
    const message2 = getNetworkErrorMessage();
    expect(message1).toBe(message2);
  });
});


