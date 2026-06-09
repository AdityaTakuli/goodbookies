/** Safe internal path for post-login redirect (blocks open redirects). */
export function isSafeRedirectPath(path: string | undefined): path is string {
  if (!path || !path.startsWith("/") || path.startsWith("//")) return false;
  return true;
}

/** Default landing after player login / signup. */
export const PLAYER_HOME = "/sports";

/** Default landing after partner login. */
export const PARTNER_HOME = "/owner";

export function resolvePlayerLoginPath(redirect?: string): string {
  if (isSafeRedirectPath(redirect)) return redirect;
  return PLAYER_HOME;
}

export function resolvePartnerLoginPath(): string {
  return PARTNER_HOME;
}
