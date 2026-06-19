import { Locale, defaultLocale } from './config'

const messages = {
    en: () => import('@/locales/en.json').then((m) => m.default),
    ua: () => import('@/locales/ua.json').then((m) => m.default),
    de: () => import('@/locales/de.json').then((m) => m.default),
    sk: () => import('@/locales/sk.json').then((m) => m.default)
}

export async function getMessages(locale: string) {
    const loader
        = messages[locale as Locale] ?? messages[defaultLocale]

    return loader()
}