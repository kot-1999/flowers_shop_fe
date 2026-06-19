import { NextRequest, NextResponse } from 'next/server'

import { CookieKey, Language } from '@/app/utils/enums'
import { getCookie, setCookie } from '@/app/utils/serverFunctions'

const supportedLocales = Object.values(Language)

function isAssetRequest(pathname: string) {
    return (
        pathname.startsWith('/_next')
        || pathname.startsWith('/api')
        || pathname === '/favicon.ico'
        || pathname.includes('.') // .css .js .ico etc
    )
}

function extractLocale(pathname: string) {
    const segment = pathname.split('/')[1]
    return supportedLocales.includes(segment as Language)
        ? (segment as Language)
        : null
}

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Hard stop for assets
    if (isAssetRequest(pathname)) {
        return NextResponse.next()
    }

    const url = request.nextUrl.clone()

    const currentLocale = extractLocale(pathname)

    // Read settings
    const settings = await getCookie(CookieKey.Settings)
    const cookieLocale
        = settings?.locale && supportedLocales.includes(settings.locale)
            ? settings.locale
            : null

    const preferredLocale = cookieLocale ?? Language.en

    // If locale missing → redirect to localized URL
    if (!currentLocale) {
        url.pathname
            = pathname === '/'
                ? `/${preferredLocale}`
                : `/${preferredLocale}${pathname}`

        return NextResponse.redirect(url)
    }

    // Optional: persist locale if missing in cookie
    if (!cookieLocale) {
        await setCookie(CookieKey.Settings, {
            ...settings,
            locale: preferredLocale
        })
    }

    return NextResponse.next()
}