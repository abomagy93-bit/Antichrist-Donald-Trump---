import { Language } from '../types';

export async function translateTextToAllLanguages(
  sourceText: string,
  _sourceLang: Language = 'ar'
): Promise<Record<Language, string>> {
  return {
    ar: sourceText,
    en: sourceText,
    zh: sourceText,
    de: sourceText,
    hi: sourceText,
    ur: sourceText,
    tr: sourceText,
    ru: sourceText,
    es: sourceText,
    fa: sourceText,
    el: sourceText,
    he: sourceText,
  };
}
