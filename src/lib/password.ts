/** Password policy. Mirror these in Supabase: Auth → Providers → Email → password requirements. */
export const passwordRules = [
  { id: "len", label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { id: "lower", label: "A lowercase letter", test: (p: string) => /[a-z]/.test(p) },
  { id: "upper", label: "An uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { id: "digit", label: "A number", test: (p: string) => /\d/.test(p) },
  { id: "symbol", label: "A symbol (!@#$…)", test: (p: string) => /[^A-Za-z0-9]/.test(p) },
] as const;

export function checkPassword(p: string, email = "") {
  const passed = passwordRules.filter((r) => r.test(p)).map((r) => r.id);
  const local = email.split("@")[0]?.toLowerCase();
  const containsEmail = !!local && local.length >= 3 && p.toLowerCase().includes(local);
  const tooLong = p.length > 72; // bcrypt limit used by Supabase
  const ok = passed.length === passwordRules.length && !containsEmail && !tooLong;
  const score = Math.min(4, Math.max(0, passed.length - 1 + (p.length >= 12 ? 1 : 0) - (containsEmail ? 2 : 0)));
  const error = tooLong
    ? "Password must be 72 characters or fewer."
    : containsEmail
      ? "Password can't contain your email name."
      : !ok
        ? "Password doesn't meet all the requirements."
        : "";
  return { ok, passed, score, error };
}
