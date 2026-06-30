// 이메일 암호화/복호화 유틸 — 브라우저 내장 Web Crypto API(AES-GCM) 사용
// 서버 없이 클라이언트에서 처리하므로 키는 반드시 .env.local에서 관리해야 합니다.

const encoder = new TextEncoder();
const decoder = new TextDecoder();

// AES-GCM CryptoKey 캐시 — 매 호출마다 importKey 하지 않도록 모듈 레벨에서 보관
let cachedKey = null;

async function getKey() {
  if (cachedKey) return cachedKey;
  // 환경변수 키를 정확히 32바이트(256-bit)로 맞춤
  const keyStr = import.meta.env.VITE_ENCRYPT_KEY || "defaultBabyFoodKey!!!padding!!!!!";
  const raw = encoder.encode(keyStr.padEnd(32, "!").slice(0, 32));
  cachedKey = await crypto.subtle.importKey(
    "raw",
    raw,
    { name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"]
  );
  return cachedKey;
}

function toBase64(buffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}

function fromBase64(str) {
  return Uint8Array.from(atob(str), (c) => c.charCodeAt(0));
}

// 평문 → AES-GCM 암호화 → Base64 문자열 반환
// IV(12바이트)를 암호문 앞에 붙여 하나의 Base64 값으로 직렬화합니다.
export async function encryptData(text) {
  const key = await getKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoder.encode(text)
  );
  const combined = new Uint8Array(iv.byteLength + encrypted.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(encrypted), iv.byteLength);
  return toBase64(combined.buffer);
}

// Base64 암호문 → 복호화 → 평문 반환
// 복호화 실패 시 원문 그대로 반환 — 기존 평문 데이터와의 호환성 유지
export async function decryptData(encryptedText) {
  try {
    const key = await getKey();
    const combined = fromBase64(encryptedText);
    const iv = combined.slice(0, 12);
    const data = combined.slice(12);
    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      data
    );
    return decoder.decode(decrypted);
  } catch {
    return encryptedText;
  }
}

// UI 표시용 이메일 마스킹 — te***@gm***.com 형태로 변환
export function maskEmail(email) {
  if (!email || !email.includes("@")) return email;
  const [local, domain] = email.split("@");
  const [domainName, ...rest] = domain.split(".");
  const maskedLocal =
    local.length <= 2
      ? local[0] + "*"
      : local.slice(0, 2) + "*".repeat(local.length - 2);
  const maskedDomain =
    domainName.length <= 2
      ? domainName[0] + "*"
      : domainName.slice(0, 2) + "*".repeat(domainName.length - 2);
  return `${maskedLocal}@${maskedDomain}.${rest.join(".")}`;
}
