export interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
  };
}
