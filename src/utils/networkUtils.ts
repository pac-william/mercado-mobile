interface NetworkErrorLike {
  response?: unknown;
  request?: unknown;
  isNetworkError?: boolean;
  networkError?: boolean;
  isAxiosError?: boolean;
  name?: string;
  code?: string;
  config?: unknown;
  message?: string;
}

const isNetworkErrorLike = (error: unknown): error is NetworkErrorLike => {
  return typeof error === 'object' && error !== null;
};

/**
 * Utilitário para detectar se um erro é relacionado à rede/conexão
 * IMPORTANTE: Se há error.response (resposta do servidor), NÃO é erro de rede
 */
export const isNetworkError = (error: unknown): boolean => {
  if (!error || !isNetworkErrorLike(error)) return false;

  // REGRA PRINCIPAL: Se há resposta do servidor, NÃO é erro de rede
  // Erros de rede acontecem quando NÃO há resposta do servidor
  if (error.response) {
    return false;
  }

  // Verifica flags adicionadas pelo interceptor (já validadas lá)
  if (error.isNetworkError === true || error.networkError === true) {
    return true;
  }

  // Erro de requisição sem resposta (sem conexão) - caso mais comum
  if (error.request && !error.response) {
    return true;
  }

  // Verifica se é um erro do Axios sem resposta
  if (error.isAxiosError === true || error.name === 'AxiosError') {
    // Se não tem resposta, é erro de rede
    if (!error.response && error.request) {
      return true;
    }
    
    // Erro de timeout (sem resposta)
    if ((error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") && !error.response) {
      return true;
    }
    
    // Códigos de erro de rede (sem resposta)
    if ((error.code === "ERR_NETWORK" || error.code === "ECONNREFUSED" || error.code === "ENOTFOUND" || error.code === "ERR_INTERNET_DISCONNECTED") && !error.response) {
      return true;
    }
  }

  // Verifica se o erro tem o formato de erro do Axios sem conexão
  if (error.config && !error.response && error.request) {
    return true;
  }

  // Verifica mensagem específica "Network Error" (apenas se não há resposta)
  if (!error.response && (error.message === "Network Error" || error.message?.includes("Network Error"))) {
    return true;
  }

  // Verifica timeout na mensagem (apenas se não há resposta)
  if (!error.response && error.message?.includes("timeout")) {
    return true;
  }

  // Verifica mensagens específicas de erro de rede (apenas se não há resposta)
  if (!error.response) {
    const errorMessage = error.message?.toLowerCase() || '';
    if (
      errorMessage.includes('network request failed') || 
      errorMessage.includes('failed to fetch') ||
      errorMessage.includes('no internet') ||
      (errorMessage.includes('connection') && (error.request || error.code))
    ) {
      return true;
    }
  }

  return false;
};

/**
 * Retorna uma mensagem amigável para erros de rede
 */
export const getNetworkErrorMessage = (): string => {
  return "Sem conexão com a internet. Verifique sua conexão e tente novamente.";
};
