export function encrypt(obj: any): string {
  const s = typeof obj === 'string' ? `${obj}` : JSON.stringify(obj);
  return Buffer.from(s).toString('base64');
}

export function decrypt(text: string): string {
  return Buffer.from(text, 'base64').toString('ascii');
}

export function decryptJson(text: string): any {
  return JSON.parse(decrypt(text));
}
