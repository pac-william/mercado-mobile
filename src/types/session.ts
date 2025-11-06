export interface SessionUser {
  given_name: string;
  family_name: string;
  nickname: string;
  name: string;
  picture: string;
  email: string;
  email_verified: boolean;
  sub: string;
}

export interface SessionTokenSet {
  accessToken: string;
  idToken: string;
  scope: string;
  requestedScope: string;
  refreshToken: string;
  expiresAt: number;
}

export interface SessionInternal {
  sid: string;
  createdAt: number;
}

export interface Session {
  user: SessionUser;
  tokenSet: SessionTokenSet;
  internal: SessionInternal;
  exp: number;
}

