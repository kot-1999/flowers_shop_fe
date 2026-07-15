import { message } from 'antd'
import { useIntl } from 'react-intl'

import { Language, LocalStorageKey, OrderState } from '@/app/utils/enums'

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

export const getOrderStateColor = (state: OrderState) => {
    switch (state) {
    case OrderState.Pending:
        return 'gold'

    case OrderState.Paid:
        return 'blue'

    case OrderState.Processing:
        return 'cyan'

    case OrderState.Shipped:
        return 'purple'

    case OrderState.Delivered:
        return 'green'

    case OrderState.Cancelled:
        return 'red'

    case OrderState.Refunded:
        return 'orange'

    case OrderState.Expired:
        return 'default'

    case OrderState.PaymentFailed:
        return 'volcano'

    default:
        return 'default'
    }
}

export const initEnumTranslations = (t: (val: string) => string) => {
    // GoodState
    t('Available')
    t('NoShow')
    t('Awaiting')
    t('Deleted')

    // UserRole
    t('Admin')
    t('User')
    t('NotRegistered')

    // Language names
    t('English')
    t('Ukrainian')
    t('Slovak')
    t('German')

    // OrderState
    t('Pending')
    t('Paid')
    t('Processing')
    t('Shipped')
    t('Delivered')
    t('Cancelled')
    t('Refunded')
    t('Expired')
    t('PaymentFailed')

    // Countries
    t('UnitedKingdom')
    t('Austria')
    t('Belgium')
    t('Bulgaria')
    t('Croatia')
    t('Cyprus')
    t('CzechRepublic')
    t('Denmark')
    t('Estonia')
    t('Finland')
    t('France')
    t('Germany')
    t('Greece')
    t('Hungary')
    t('Ireland')
    t('Italy')
    t('Latvia')
    t('Lithuania')
    t('Luxembourg')
    t('Malta')
    t('Netherlands')
    t('Poland')
    t('Portugal')
    t('Romania')
    t('Slovakia')
    t('Slovenia')
    t('Spain')
    t('Sweden')

    t('Albania')
    t('Andorra')
    t('Armenia')
    t('Azerbaijan')
    t('BosniaAndHerzegovina')
    t('Georgia')
    t('Iceland')
    t('Kosovo')
    t('Liechtenstein')
    t('Moldova')
    t('Monaco')
    t('Montenegro')
    t('NorthMacedonia')
    t('Norway')
    t('SanMarino')
    t('Serbia')
    t('Switzerland')
    t('Turkey')
    t('Ukraine')
    t('VaticanCity')

    t('Australia')
    t('Canada')
    t('China')
    t('HongKong')
    t('India')
    t('Israel')
    t('Japan')
    t('Kazakhstan')
    t('Malaysia')
    t('NewZealand')
    t('Singapore')
    t('SouthKorea')
    t('Taiwan')
    t('Thailand')
    t('UnitedArabEmirates')
    t('UnitedStates')

    t('Argentina')
    t('Brazil')
    t('Chile')
    t('Colombia')
    t('Mexico')
    t('Paraguay')
    t('Peru')
    t('Uruguay')

    t('Egypt')
    t('Morocco')
    t('SouthAfrica')
}