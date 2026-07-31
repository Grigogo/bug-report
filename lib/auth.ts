// Простая защита паролем. Пользователи задаются переменной окружения
// AUTH_USERS в формате «логин:пароль,логин2:пароль2». Если переменная
// не задана (локальный запуск) — сайт открыт, как раньше.
//
// Сессия — cookie вида "логин.срок.подпись", подписанная HMAC-SHA256.
// Ключ подписи — сама строка AUTH_USERS: смена любого пароля
// автоматически разлогинивает всех.
//
// Файл импортируется из proxy.ts (edge-runtime) — здесь нельзя
// использовать Prisma и node-модули, только Web Crypto.

export const SESSION_COOKIE = "bugreport_session";
const SESSION_DAYS = 30;

export function authEnabled(): boolean {
  return Boolean(process.env.AUTH_USERS);
}

function parseUsers(): Map<string, string> {
  const users = new Map<string, string>();
  for (const pair of (process.env.AUTH_USERS ?? "").split(",")) {
    const sep = pair.indexOf(":");
    if (sep > 0) {
      users.set(pair.slice(0, sep).trim(), pair.slice(sep + 1).trim());
    }
  }
  return users;
}

export function checkCredentials(login: string, password: string): boolean {
  const expected = parseUsers().get(login);
  return expected !== undefined && password !== "" && timingSafeEqual(expected, password);
}

async function hmac(payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(process.env.AUTH_USERS ?? ""),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function createSession(login: string): Promise<{ token: string; maxAge: number }> {
  const expires = Date.now() + SESSION_DAYS * 86_400_000;
  const payload = `${encodeURIComponent(login)}.${expires}`;
  return {
    token: `${payload}.${await hmac(payload)}`,
    maxAge: SESSION_DAYS * 86_400,
  };
}

/** Возвращает логин из валидной cookie, иначе null */
export async function verifySession(token: string | undefined): Promise<string | null> {
  if (!token) return null;
  const [encodedLogin, expiresStr, sig] = token.split(".");
  if (!encodedLogin || !expiresStr || !sig) return null;

  const expires = Number(expiresStr);
  if (!Number.isFinite(expires) || Date.now() > expires) return null;

  const expected = await hmac(`${encodedLogin}.${expiresStr}`);
  if (!timingSafeEqual(sig, expected)) return null;

  const login = decodeURIComponent(encodedLogin);
  return parseUsers().has(login) ? login : null;
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
