'use client'

import { Pagination } from 'antd'

import { LocalStorageKey } from '@/app/utils/enums'
import { setLocalStorage, getTFunc } from '@/app/utils/helpers'

interface Props {
    storageKey: LocalStorageKey
    total: number
    pageSize: number
    current: number
    callFunc: () => void
}

export default function SimplePagination({
    storageKey,
    total,
    pageSize,
    current,
    callFunc
}: Props) {
    const t = getTFunc()
    const onChange = (page: number, pageSize: number) => {
        setLocalStorage(storageKey, {
            page,
            limit: pageSize
        })

        callFunc()
    }

    return (
        <Pagination
            total={total}
            pageSize={pageSize}
            current={current}
            onChange={onChange}
            defaultCurrent={1}
            align="center"
            hideOnSinglePage
            showSizeChanger
            pageSizeOptions={['12', '24', '48']}
            locale={{
                items_per_page: t('/ page') // 👈 this changes "page"
            }}
            style={{
                marginTop: 36,
                marginBottom: 36
            }}
        />
    )
}