import { useIntl } from 'react-intl'

import { Language, LocalStorageKey } from '@/app/utils/enums'

export function getTFunc() {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const intl = useIntl()

    return (key: string) =>
        intl.formatMessage({ id: key })
}

export const fetchSettings = async () => {
    const res = await fetch('/api/cookie/settings', {
        method: 'GET'
    })

    if (!res.ok) {
        throw new Error('Failed to fetch settings')
    }

    return res.json()
}

export const setLocalStorage = (key: LocalStorageKey, value: any) => {
    if (typeof window === 'undefined') {return}

    localStorage.setItem(key, JSON.stringify(value))
}

export const getLocalStorage = (key: string) => {
    if (typeof window === 'undefined') {return null}

    const item = localStorage.getItem(key)

    try {
        return item ? JSON.parse(item) : null
    } catch {
        return item
    }
}

export const removeLocalStorage = (key: LocalStorageKey) => {
    if (typeof window === 'undefined') {return}

    localStorage.removeItem(key)
}

export const languageOptions = [
    {
        value: Language.en,
        label: '🇬🇧 English' 
    },
    {
        value: Language.ua,
        label: '🇺🇦 Українська' 
    },
    {
        value: Language.de,
        label: '🇩🇪 Deutsch' 
    },
    {
        value: Language.sk,
        label: '🇸🇰 Slovak' 
    }
]

export function extractS3Key(url: string | null | undefined): string | null {
    try {
        if (!url) {
            return null
        }

        const res =  url.split('/').slice(4)
            .join('/') || null

        return res
    } catch {
        return null
    }
}