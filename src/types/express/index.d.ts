declare namespace Express {
  export interface TokenPayload {
    id: string;
    role: string;
  }

  export interface Request {
    user?: TokenPayload;
  }
}
