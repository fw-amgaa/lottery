export type Operator = "unitel" | "skytel" | "gmobile" | "mobicom" | "unknown";

const PREFIX_MAP: Record<string, Operator> = {
  "90": "skytel",
  "91": "skytel",
  "92": "skytel",
  "96": "skytel",
  "93": "gmobile",
  "97": "gmobile",
  "98": "gmobile",
  "83": "gmobile",
  "94": "mobicom",
  "95": "mobicom",
  "99": "mobicom",
  "85": "mobicom",
  "80": "unitel",
  "86": "unitel",
  "88": "unitel",
  "89": "unitel",
};

export function identifyOperator(phone: string): Operator {
  if (phone.length < 2) return "unknown";
  // 69 6XXXXX — Skytel (must check 3-digit prefix first)
  if (phone.startsWith("696")) return "skytel";
  return PREFIX_MAP[phone.substring(0, 2)] ?? "unknown";
}

export async function sendSms(to: string, message: string): Promise<void> {
  const url = process.env.BANK_FETCHER_URL;
  const secret = process.env.CALLBACK_SECRET;
  if (!url || !secret) {
    console.warn("[sms] BANK_FETCHER_URL or CALLBACK_SECRET not configured — SMS skipped");
    return;
  }

  const operator = identifyOperator(to);
  const operatorEndpoint: Record<Operator, string> = {
    unitel: `${url}/sms/unitel`,
    skytel: `${url}/sms/skytel`,
    gmobile: `${url}/sms/gmobile`,
    mobicom: `${url}/sms/mobicom`,
    unknown: `${url}/sms/unitel`,
  };

  const endpoint = operatorEndpoint[operator];

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": secret },
      body: JSON.stringify({ to, message }),
    });
    if (!res.ok) {
      console.error(`[sms/${operator}] Failed:`, res.status, await res.text());
    }
  } catch (err) {
    console.error(`[sms/${operator}] Error:`, err);
  }
}
