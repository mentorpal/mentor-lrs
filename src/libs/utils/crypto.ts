export function encrypt(obj: any, key = ''): string {
  const s = typeof obj === 'string' ? `${obj}` : JSON.stringify(obj);
  return Buffer.from(s).toString('base64');
}

export function decrypt(text: string, key = ''): string {
  return Buffer.from(text, 'base64').toString('ascii');
}

export function decryptJson(text: string, key = ''): any {
  return JSON.parse(decrypt(text, key));
}
