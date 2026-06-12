import {useIntl} from "react-intl";
import {LocalStorageKey} from "@/app/utils/enums";

export function useT() {
    const intl = useIntl();

    return (key: string) =>
        intl.formatMessage({ id: key });
}

export const fetchSettings = async () => {
    const res = await fetch('/api/cookie/settings', {
        method: 'GET',
    })

    if (!res.ok) {
        throw new Error('Failed to fetch settings')
    }

    return res.json()
}

export const setLocalStorage = (key: LocalStorageKey, value: any) => {
    if (typeof window === 'undefined') return

    localStorage.setItem(key, JSON.stringify(value))
}

export const getLocalStorage = (key: string) => {
    if (typeof window === 'undefined') return null

    const item = localStorage.getItem(key)

    try {
        return item ? JSON.parse(item) : null
    } catch {
        return item
    }
}

export const removeLocalStorage = (key: LocalStorageKey) => {
    if (typeof window === 'undefined') return

    localStorage.removeItem(key)
}
