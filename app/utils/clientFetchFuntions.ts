import { Defaults, LocalStorageKey } from '@/app/utils/enums'
import { getLocalStorage } from '@/app/utils/helpers'

export const commonFetch = async (options: {
    type: 'selectionists' | 'tags' | 'categories' | 'adminTags' | 'itemTypes' | 'adminItemTypes'
    setLoading?: (value: boolean) => void
    search?: string,
    paginationKey?: LocalStorageKey,
    setData?: (value: any) => void,
}) => {
    const { setLoading, search, paginationKey, setData, type } = options
    
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