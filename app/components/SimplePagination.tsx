'use client'

import { Pagination } from "antd"
import { LocalStorageKey } from "@/app/utils/enums"
import {getLocalStorage, setLocalStorage, useT} from "@/app/utils/helpers"

type Props = {
    storageKey: LocalStorageKey
    total: number
    pageSize: number
    current: number
    callFunc: Function
}

export default function SimplePagination({
     storageKey,
     total,
     pageSize,
     current,
     callFunc
 }: Props) {
    const t = useT()
    const onChange = (page: number, pageSize: number) => {
        const stored = getLocalStorage(storageKey) ?? {}

        setLocalStorage(storageKey, {
            ...stored,
            pagination: {
                ...stored.pagination,
                page,
                limit: pageSize
            },
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
                items_per_page: t('/ page'), // 👈 this changes "page"
            }}
        />
    )
}