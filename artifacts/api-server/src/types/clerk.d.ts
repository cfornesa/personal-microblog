declare global {
  namespace Express {
    interface Request {
      clerkUserId?: string;
      clerkSessionClaims?: {
        given_name?: string;
        first_name?: string;
        family_name?: string;
        last_name?: string;
        email?: string;
        preferred_username?: string;
        picture?: string;
        image_url?: string;
        [key: string]: unknown;
      };
    }
  }
}

export {};
