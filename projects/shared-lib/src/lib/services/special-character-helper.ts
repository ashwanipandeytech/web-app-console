import { Injectable } from '@angular/core';
interface SpecialCharConfig {
  replaceWithSpace?: string[];
  remove?: string[];
  allowOnly?: string[];   // 🆕 whitelist
  capitalize?: boolean;
}

@Injectable({
  providedIn: 'root'
})

export class SpecialCharacterHelper {

constructor() { 


}
private escapeForRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

specialCharacterChecker(
  value: string,
  config: {
    replaceWithSpace?: string[];
    remove?: string[];
    allowOnly?: string[];
    capitalize?: boolean;
  } = {}
): string {

  let result = value ?? '';

  const escape = (char: string) =>
    char.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // 1️⃣ Replace selected chars with SPACE (FIRST)
  if (config.replaceWithSpace?.length) {
    const pattern = config.replaceWithSpace
      .map(escape)
      .join('|');

    result = result.replace(new RegExp(pattern, 'g'), ' ');
  }

  // 2️⃣ Remove selected chars
  if (config.remove?.length) {
    const pattern = config.remove
      .map(escape)
      .join('|');

    result = result.replace(new RegExp(pattern, 'g'), '');
  }

  // 3️⃣ Allow ONLY selected chars (WHITELIST LAST)
  if (config.allowOnly?.length) {
    const allowed = config.allowOnly
      .map(escape)
      .join('');

    result = result.replace(
      new RegExp(`[^a-zA-Z0-9\\s${allowed}]`, 'g'),
      ''
    );
  }

  // 4️⃣ Normalize spaces
  result = result
    .replace(/\s+/g, ' ')
    .trim();

  // 5️⃣ Capitalize
  if (config.capitalize) {
    result = result.replace(/\b\w/g, c => c.toUpperCase());
  }

  return result;
}





}
