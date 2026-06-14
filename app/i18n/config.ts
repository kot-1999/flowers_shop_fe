import { Language } from '@/app/utils/enums'

export const locales = Object.values(Language)
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = Language.en