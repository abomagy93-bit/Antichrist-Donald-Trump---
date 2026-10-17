export type Language =
  | 'ar'
  | 'en'
  | 'ru'
  | 'es'
  | 'fa'
  | 'zh'
  | 'de'
  | 'hi'
  | 'ur'
  | 'tr'
  | 'el'
  | 'he';

export interface LanguageInfo {
  code: Language;
  name: string;
  nativeName: string;
  dir: 'ltr' | 'rtl';
  flag: string;
}

export type LocalizedString = Record<Language, string>;

export interface GalleryImage {
  id: string;
  url: string;
  originalPageUrl: string;
  title: LocalizedString;
  caption: LocalizedString;
}

export interface ResearchArticle {
  id: string;
  title: LocalizedString;
  subtitle: LocalizedString;
  author: string;
  authorUrl: string;
  authorTitle: LocalizedString;
  publishedDate: string;
  lastUpdated: string;
  featuredImageUrl: string;
  featuredImageCaption: LocalizedString;
  introduction: LocalizedString;
  gallery?: GalleryImage[];
  sections: {
    id: string;
    heading: LocalizedString;
    content: LocalizedString;
    media?: {
      type: 'image' | 'video';
      url: string;
      caption: LocalizedString;
      position?: 'inline' | 'full';
    };
    gallery?: GalleryImage[];
  }[];
  conclusion: LocalizedString;
}
