import { message } from 'antd'
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'

import { Defaults, LocalStorageKey } from '@/app/utils/enums'
import { checkRes, getLocalStorage } from '@/app/utils/helpers'

export const getInvoice = async (orderID: string, setInvoiceLoading: (val: boolean) => void, t: (val: string) => string) => {
    if (!orderID) {
        return
    }

    setInvoiceLoading(true)

    try {
        const auth = getLocalStorage(LocalStorageKey.CheckoutToken)

        const headers: any = auth ? { 'Authorization': 'Bearer ' + auth } : { }

        const res = await fetch(`/api/checkout/order/${orderID}`, headers)

        const data = await res.json()

        const ok = await checkRes(
            res,
            data,
            t('Unable to generate invoice')
        )

        if (!ok) {
            return
        }

        if (data.pdfUrl) {
            window.open(
                data.pdfUrl,
                '_blank'
            )
        }
    } catch {
        message.error(t('Unable to generate invoice'))
    } finally {
        setInvoiceLoading(false)
    }
}

export const fetchCart = async (user: any, setCartData: (val: any) => void, setLoading: (val: boolean) => void, t: (val: string) => string) => {
    try {

        setLoading(true)

        const res = user
            ? await fetch('/api/basket-items')
            : await fetch('/api/basket-items/public', { method: 'POST' })

        const data = await res.json()
        const ok = await checkRes(res, data, t('Failed to load cart'))
        if (!ok) {return}

        setCartData(data)
    } catch (error: any) {
        message.error(error.message || t('Failed to load cart'))
    } finally {
        setLoading(false)
    }
}

export const saveCartChanges = async (
    user: any,
    pendingUpdates: any,
    pendingDeletes: any,
    setPendingUpdates: any,
    setPendingDeletes: any,
    setEditMode: any,
    setCartData: any,
    setLoading: (val: boolean) => void,
    t: (val: string) => string
) => {
    try {
        const endpoint = user
            ? '/api/basket-items'
            : '/api/cookie/basket'

        const updates = Object.values(pendingUpdates).map((toUpdate: any) => ({
            basketItemID: toUpdate.basketItemID,
            quantity: toUpdate.quantity
        }))

        const deletes = Object.values(pendingDeletes)

        if (updates.length) {
            const res = await fetch(endpoint, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ basketItems: updates })
            })

            const data = await res.json()
            await checkRes(res, data, t('Failed to update items'))
        }

        if (deletes.length) {
            const res = await fetch(endpoint, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ basketItems: deletes })
            })

            const data = await res.json()
            await checkRes(res, data, t('Failed to delete items'))
        }

        setPendingUpdates({})
        setPendingDeletes({})
        setEditMode(false)

        await fetchCart(user, setCartData, setLoading, t)
    } catch (error: any) {
        message.error(error.message || t('Failed to update cart'))
    }
}

export async function uploadFile(file: File): Promise<{
    publicUrl: string,
    key: string,
}> {
    const formData = new FormData()

    formData.append('files', file)

    const res = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData
    })

    const data = await res.json()

    if (!res.ok) {
        throw new Error(data?.message || 'Upload failed')
    }

    const uploaded = data.files?.[0]

    if (!uploaded) {
        throw new Error('Upload failed')
    }

    return uploaded
}

export const commonFetch = async (options: {
    type: 'selectionists' | 'tags' | 'categories' | 'adminTags' | 'itemTypes' | 'adminItemTypes' | 'adminCategories'
    setLoading?: (value: boolean) => void
    search?: string,
    paginationKey?: LocalStorageKey,
    setData?: (value: any) => void,
    categoryKey?: LocalStorageKey,
}) => {
    const { setLoading, search, paginationKey, setData, type, categoryKey } = options
    if (setLoading) {
        setLoading(true)
    }
    try {
        const params = new URLSearchParams()

        const stored = paginationKey ? getLocalStorage(paginationKey) : {}

        params.set(
            'page',
            String(stored?.page ?? Defaults.Page)
        )

        params.set(
            'limit',
            String(stored?.limit ?? Defaults.Limit)
        )

        if (search && type !== 'categories') {
            params.set('search', search)
        }

        if (categoryKey) {
            const category = getLocalStorage(categoryKey)
            if (category?.id) {
                params.set('categoryID', category.id)
            }
        }

        let url = ''

        switch (type) {
        case 'selectionists':
            url = '/api/selectionists'
            break
        case 'tags':
            url = '/api/tags'
            break
        case 'adminTags':
            url = '/api/admin/tags'
            break
        case 'itemTypes':
            url = '/api/item-types'
            break
        case 'adminItemTypes':
            url = '/api/admin/item-types'
            break
        case 'categories':
            url = '/api/categories'
            break
        case 'adminCategories':
            url = '/api/admin/categories'
            break
        default:
            throw new Error(`Unknown type ${type} in commonFetch`)
        }

        const res = await fetch(
            `${url}?${params.toString()}`,
            {
                method: 'GET'
            }
        )

        const data = await res.json()

        if (setData) {
            setData(data)
        }
    } finally {
        if (setLoading) {
            setLoading(false)
        }
    }
}

export const generateAndFetchTranslations = async ({
    form,
    activeLanguage,
    fields,
    t,
    setAiLoading,
    setLatestTranslations
}: {
    form: any
    activeLanguage: string
    fields: string[]
    t: (key: string) => string
    setAiLoading: (value: boolean) => void,
    setLatestTranslations: Array<(val: any) => void>
}) => {
    try {
        const values = form.getFieldsValue()

        const texts = fields.map((field) => values?.[field]?.[activeLanguage] || '')

        if (texts.some((text) => !text.trim())) {
            message.warning(t('Enter text first'))
            return
        }

        setAiLoading(true)

        const res = await fetch('/api/ai/translations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                text: texts
            })
        })
        const data = await res.json()

        const isSuccess = await checkRes(res, data,  t('AI translation failed'))

        if (!isSuccess) {
            return
        }

        const updates: Record<string, any> = {}

        fields.forEach((field, index) => {
            const translations = {
                ...(form.getFieldValue(field) || {}),
                ...(data.translations?.[index] || {})
            }
            updates[field] = translations
            setLatestTranslations[index]?.(translations)
        })

        form.setFieldsValue(updates)

        message.success(t('Translations generated'))
    } catch {
        message.error(t('AI translation failed'))
    } finally {
        setAiLoading(false)
    }
}

export const fetchAddresses = async (setAddresses: (val: any) => void, setLoading: (val: any) => void, t: (val: string) => string) => {
    setLoading(true)

    try {
        const res = await fetch('/api/addresses')
        const data = await res.json()

        setAddresses(data.addresses || [])
    } catch {
        message.error(t('Failed to load addresses'))
    } finally {
        setLoading(false)
    }
}

export const fetchUser = async (authUser: any, setLoading: (val: boolean) => void, setUser: (data: any) => void, router?: AppRouterInstance) => {
    try {
        if (!authUser) {return}

        setLoading(true)

        const res = await fetch(`/api/users/${authUser.id}`)

        if (!res.ok) {
            if (router) {
                router.push('/')
            }
            return
        }

        const data = await res.json()
        setUser(data.user)
    } catch {
        if (router) {
            router.push('/')
        }
    } finally {
        setLoading(false)
    }
}

export const addToBasket = async (
    pricingID: string,
    quantity: number,
    t: (key: string) => string,
    user: any
) => {
    try {
        const response = await fetch(user ? '/api/basket-items' : '/api/cookie/basket', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                pricingID,
                quantity
            })
        })

        const data = await response.json()

        await checkRes(response, data, t('Failed to add item to basket'), !user ?  t('Item added to cart') : null)
    } catch (error: any) {
        message.error(error.message || t('Failed to add item to basket'))
    }
}