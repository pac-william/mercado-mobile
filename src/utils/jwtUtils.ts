export interface DecodedJWT {
  sub?: string;
  email?: string;
  name?: string;
  iat?: number;
  exp?: number;
  [key: string]: any;
}

export const decodeJWT = (token: string): DecodedJWT => {
  if (!token || typeof token !== 'string' || token.trim().length === 0) {
    throw new Error('Token inválido: token vazio ou inválido');
  }

  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Token inválido: formato incorreto');
    }

    if (!parts[1] || parts[1].trim().length === 0) {
      throw new Error('Token inválido: payload vazio');
    }

    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    if (error instanceof Error && error.message.includes('Token inválido')) {
      throw error;
    }
    console.error('Erro ao decodificar token:', error);
    throw new Error('Token inválido');
  }
};

export const isJWTToken = (token: string): boolean => {
  if (!token || typeof token !== 'string') {
    return false;
  }
  const parts = token.split('.');
  return parts.length === 3;
};

export const getAuth0IdFromToken = (token: string): string => {
  if (!isJWTToken(token)) {
    throw new Error('Token não é um JWT válido');
  }

  const decoded = decodeJWT(token);
  const auth0Id = decoded.sub;

  if (!auth0Id || typeof auth0Id !== 'string') {
    throw new Error('Token não contém auth0Id (sub)');
  }

  return auth0Id;
};

