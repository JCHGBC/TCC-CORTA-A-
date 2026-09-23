/**
 * Hash de senha no front-end apenas para a versão de demonstração.
 * No back-end definitivo o hash deve ser feito no servidor (ex.: bcrypt/argon2)
 * e a senha deve trafegar somente por HTTPS.
 */

function fallbackHash(value: string) {
  // FNV-1a 32 bits repetido — usado apenas quando o navegador não oferece crypto.subtle
  let hash = 0x811c9dc5;
  let out = "";
  for (let round = 0; round < 4; round++) {
    for (let i = 0; i < value.length; i++) {
      hash ^= value.charCodeAt(i) + round;
      hash = Math.imul(hash, 0x01000193);
    }
    out += (hash >>> 0).toString(16).padStart(8, "0");
  }
  return out;
}

export async function hashPassword(password: string) {
  const salted = `corta-ai::${password}`;
  if (typeof crypto !== "undefined" && crypto.subtle) {
    const data = new TextEncoder().encode(salted);
    const buffer = await crypto.subtle.digest("SHA-256", data);
    const hex = Array.from(new Uint8Array(buffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    return `sha256:${hex}`;
  }
  return `fnv:${fallbackHash(salted)}`;
}

export async function verifyPassword(password: string, storedHash: string) {
  return (await hashPassword(password)) === storedHash;
}
