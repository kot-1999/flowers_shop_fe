import { message } from 'antd'
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

interface ErrorResponse {
    message?: string
    messages?: string[]
}

export const checkRes = async (
    res: Response,
    data: ErrorResponse,
    fallbackMessage: string,
    successMessage: string | null = null
): Promise<boolean> => {
    if (!res.ok) {
        if (data?.message) {
            message.error(data.message)
        } else if (data?.messages) {
            data.messages.forEach((item: string) => message.error(item))
        } else {
            message.error(fallbackMessage)
        }

        return false
    } else if (data.message || successMessage) {
        message.success(successMessage ?? data.message)
    }

    return true
}

export const updateItem = (
    basketItemID: string,
    quantity: number,
    pricingID: string,
    setPendingUpdates: any,
    setCartData: any
) => {
    setPendingUpdates((prev: any) => ({
        ...prev,
        [basketItemID]: {
            basketItemID,
            quantity,
            pricingID
        }
    }))

    setCartData((prev: any) => {
        if (!prev) {return prev}

        const updateList = (list: any[] = []) =>
            list.map((item: any) =>
                item.id === basketItemID
                    ? {
                        ...item,
                        quantity
                    }
                    : item)

        return {
            ...prev,
            basketItems: updateList(prev.basketItems),
            unavailableBasketItems: updateList(prev.unavailableBasketItems)
        }
    })
}

export const deleteItem = (
    basketItemID: string,
    pricingID: string,
    setPendingDeletes: any,
    setCartData: any
) => {
    setPendingDeletes((prev: any) => ({
        ...prev,
        [basketItemID]: {
            id: basketItemID,
            pricingID
        }
    }))

    // optional: remove from UI immediately
    setCartData((prev: any) => {
        if (!prev) {return prev}
        return {
            ...prev,
            basketItems: prev.basketItems?.filter((i: any) => i.id !== basketItemID)
        }
    })
}