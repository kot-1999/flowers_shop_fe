'use client'

import {useEffect, useState} from 'react'
import { Spin } from 'antd'
import SimplePagination from '@/app/components/SimplePagination'
import {useSearchParams} from 'next/navigation'
import {fetchSettings, getLocalStorage, useT} from '@/app/utils/helpers'
import {GoodState, LocalStorageKey} from "@/app/utils/enums";
import SearchBar from "@/app/components/SearchBar";
import GoodsList from "@/app/components/GoodsList";

export default function App() {
    const [goodsData, setGoods] = useState<{
        goods: any[]
        pagination: any
    }>({
        goods: [],
        pagination: {},
    })

    const [loading, setLoading] = useState(false)
    const searchParams = useSearchParams()
    const t = useT()

    const [settings, setSettings] = useState<any>(null)


    // Load application settings
    useEffect(() => {
        const loadSettings = async () => {
            try {
                const data = await fetchSettings()
                setSettings(data)
            } catch (error) {
                console.error(error)
            }
        }

        loadSettings()
    }, [])


    // Fetch goods
    const fetchGoods = async () => {
        if (!settings) return

        setLoading(true)

        try {
            const params = new URLSearchParams()
            const searchSettings = getLocalStorage(LocalStorageKey.SearchSettings) ?? {}
            console.log('!!!!!!!', searchSettings)
            params.set('page', searchSettings.pagination?.page ?? '1')
            params.set('limit', searchSettings.pagination?.limit ?? '24')
            params.set('sortBy', searchSettings.sortBy)
            params.set('sortOrder', searchSettings.sortOrder)

            if (searchSettings.appliedSearch) {
                params.set('search', searchSettings.appliedSearch)
            }

            if (searchSettings.appliedSelectionists.length) {
                searchSettings.appliedSelectionists.forEach((item: any) => {
                    params.append('selectionistIDs[]', item.id);
                });
            }

            if (searchSettings.appliedShowOnly) {
                params.set('state[]', GoodState.Available)
            }

            const res = await fetch(`/api/goods?${params.toString()}`)
            const data = await res.json()
            console.log('!!!!!!!!!', data)
            setGoods(data)
        } finally {
            setLoading(false)
        }
    }

    // Trigger goods fetch
    useEffect(() => {
        fetchGoods()
    }, [settings, searchParams])




    return (
        <div style={{ padding: 24 }}>
            <h1>{t('Goods')}</h1>

            <SearchBar fetchGoods={fetchGoods} settings={settings} />

            {/* GOODS */}
            {loading ? (
                <Spin />
            ) : (
                <div>
                    <GoodsList goodsData={goodsData} settings={settings}/>
                    <SimplePagination
                        storageKey={LocalStorageKey.SearchSettings}
                        current={goodsData?.pagination?.page ?? 1}
                        total={goodsData?.pagination?.total ?? 0}
                        pageSize={goodsData?.pagination?.limit ?? 24}
                        callFunc={fetchGoods}
                    />
                </div>
            )}
        </div>
    )
}