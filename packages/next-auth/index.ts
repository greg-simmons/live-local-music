import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";

type CredentialsAuthorize<TCredentials extends Record<string, unknown>, TUser> = (
  credentials: TCredentials,
) => Promise<TUser | null>;

export class AuthError extends Error {
  public readonly type: string;

  constructor(type: string, message?: string) {
    super(message ?? type);
    this.name = "AuthError";
    this.type = type;
  }
}

type CredentialsProviderOptions<TCredentials extends Record<string, unknown>, TUser> = {
  id?: string;
  authorize: CredentialsAuthorize<TCredentials, TUser>;
};

type CredentialsProviderResult<TCredentials extends Record<string, unknown>, TUser> = {
  id: string;
  authorize: CredentialsAuthorize<TCredentials, TUser>;
};

type JwtCallbackParams<TToken, TUser> = {
  token: TToken;
  user?: TUser;
  trigger: "signIn" | "session";
};

type SessionCallbackParams<TSession, TToken> = {
  session: TSession;
  token: TToken;
};

type NextAuthConfig<TCredentials extends Record<string, unknown>, TUser, TToken, TSession> = {
  providers: Array<CredentialsProviderResult<TCredentials, TUser>>;
  secret?: string;
  session?: {
    strategy: "jwt";
    maxAge?: number;
  };
  callbacks?: {
    jwt?: (params: JwtCallbackParams<TToken, TUser>) => Promise<TToken> | TToken;
    session?: (params: SessionCallbackParams<TSession, TToken>) => Promise<TSession> | TSession;
  };
};

const COOKIE_NAME = "llm_session";

function resolveSecret(configSecret?: string) {
  return configSecret ?? process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET ?? "development-secret";
}

function encodeToken(token: Record<string, unknown>, secret: string) {
  const payload = JSON.stringify(token);
  const signature = createHmac("sha256", secret).update(payload).digest("base64url");
  const body = Buffer.from(payload).toString("base64url");
  return `${body}.${signature}`;
}

function decodeToken<T>(token: string, secret: string): T | null {
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) {
    return null;
  }

  const payload = Buffer.from(encoded, "base64url").toString("utf8");
  const expectedSignature = createHmac("sha256", secret).update(payload).digest("base64url");
  const provided = Buffer.from(signature, "base64url");
  const expected = Buffer.from(expectedSignature, "base64url");

  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) {
    return null;
  }

  try {
    const parsed = JSON.parse(payload);
    if (typeof parsed.exp === "number" && parsed.exp * 1000 < Date.now()) {
      return null;
    }
    return parsed as T;
  } catch {
    return null;
  }
}

export function CredentialsProvider<TCredentials extends Record<string, unknown>, TUser>(
  options: CredentialsProviderOptions<TCredentials, TUser>,
): CredentialsProviderResult<TCredentials, TUser> {
  return {
    id: options.id ?? "credentials",
    authorize: options.authorize,
  };
}

type SignInParams = Record<string, unknown>;

type DefaultSession = {
  user: Record<string, unknown>;
};

type DefaultToken = Record<string, unknown> & {
  sub?: string;
  email?: string;
  role?: string;
  exp?: number;
};

export default function NextAuth<
  TCredentials extends Record<string, unknown>,
  TUser extends Record<string, unknown>,
  TToken extends DefaultToken,
  TSession extends DefaultSession,
>(config: NextAuthConfig<TCredentials, TUser, TToken, TSession>) {
  const secret = resolveSecret(config.secret);
  const maxAge = config.session?.maxAge ?? 60 * 60 * 24 * 7;
  const providers = new Map(config.providers.map((provider) => [provider.id, provider]));

  async function signIn(providerId: string, params: SignInParams) {
    const provider = providers.get(providerId);
    if (!provider) {
      throw new AuthError("Configuration", `Provider ${providerId} is not available`);
    }

    const user = await provider.authorize(params as TCredentials);
    if (!user) {
      throw new AuthError("CredentialsSignin", "Invalid credentials");
    }

    const sanitizedUser = Object.fromEntries(
      Object.entries(user as Record<string, unknown>).filter(
        ([key]) => key !== "password" && key !== "passwordHash",
      ),
    );

    let token: TToken = {
      ...(sanitizedUser as Record<string, unknown>),
      sub: (user as Record<string, unknown>).id as string,
      email: (user as Record<string, unknown>).email as string,
      role: (user as Record<string, unknown>).role as string,
      exp: Math.floor(Date.now() / 1000) + maxAge,
    } as TToken;

    if (config.callbacks?.jwt) {
      token = await config.callbacks.jwt({ token, user, trigger: "signIn" });
    }

    const session: TSession = (config.callbacks?.session
      ? await config.callbacks.session({
          session: { user: { ...sanitizedUser } } as TSession,
          token,
        })
      : ({ user: { ...sanitizedUser } } as TSession));

    const cookieStore = await cookies();

    cookieStore.set(
      COOKIE_NAME,
      encodeToken(token as Record<string, unknown>, secret),
    );

    return session;
  }

  async function auth() {
    const cookieStore = await cookies();           // ✅ await the Promise
    const cookie = cookieStore.get(COOKIE_NAME);   // ✅ now .get exists

    if (!cookie) {
      return null;
    }

    const decoded = decodeToken<TToken>(cookie.value, secret);
    if (!decoded) {
      const cookieStore = await cookies();
      cookieStore.delete(COOKIE_NAME);
      return null;
    }

    let token = decoded;

    if (config.callbacks?.jwt) {
      token = await config.callbacks.jwt({ token, trigger: "session" });
    }

    const rest = { ...(decoded as Record<string, unknown>) };
    delete (rest as Record<string, unknown>).exp;

    const session: TSession = (config.callbacks?.session
      ? await config.callbacks.session({
          session: { user: { ...rest } } as TSession,
          token,
        })
      : ({ user: { ...rest } } as TSession));

    return session;
  }

  async function signOut() {
    const cookieStore = await cookies();
    cookieStore.delete(COOKIE_NAME);
  }

  const handlers = {
    GET: async () => Response.json({ status: "ok" }),
    POST: async () => Response.json({ status: "ok" }),
  } as const;

  return { signIn, signOut, auth, handlers, AuthError };
}
