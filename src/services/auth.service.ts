import { authClient } from "../lib/auth-client";

export interface SignUpData {
  email: string;
  password: string;
  name?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export const authService = {
  async signUp(data: SignUpData) {
    try {
      const signUpPayload: { email: string; password: string; name?: string } = {
        email: data.email,
        password: data.password,
      };
      
      if (data.name) {
        signUpPayload.name = data.name;
      }
      
      const result = await authClient.signUp.email(signUpPayload);
      return result;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Sign up failed";
      throw new Error(message);
    }
  },

  async signIn(data: SignInData) {
    try {
      const result = await authClient.signIn.email({
        email: data.email,
        password: data.password,
      });
      return result;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Sign in failed";
      throw new Error(message);
    }
  },

  async signOut() {
    try {
      await authClient.signOut();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Sign out failed";
      throw new Error(message);
    }
  },

  async getSession() {
    try {
      const session = await authClient.getSession();
      return session;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to get session";
      throw new Error(message);
    }
  },
};
