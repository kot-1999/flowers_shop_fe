'use client'

import {useEffect, useState} from 'react'
import {Spin} from 'antd'
import SimplePagination from '@/app/components/SimplePagination'
import {usePathname} from 'next/navigation'
import {fetchSettings, getLocalStorage, useT} from '@/app/utils/helpers'
import {Defaults, GoodState, LocalStorageKey} from "@/app/utils/enums";
import SearchBar from "@/app/components/SearchBar";
import GoodsList from "@/app/components/GoodsList";

export default function Categories() {
    const [goodsData, setGoods] = useState<{
        goods: any[]
        pagination: any
    }>({
        goods: [],
        pagination: {},
    })

    const [loading, setLoading] = useState(false)
    const t = useT()

    const [settings, setSettings] = useState<any>(null)
    const [settingsLoaded, setSettingsLoaded] = useState(false)

    const pathname = usePathname();
    // Load application settings
    useEffect(() => {
        const loadSettings = async () => {
            try {
                const data = await fetchSettings()
                setSettings(data)
            } catch (error) {
                console.error(error)
            } finally {
                setSettingsLoaded(true)
            }
        }

        loadSettings()
    }, [])


    // Fetch goods
    const fetchHome = async () => {
        try {
            const params = new URLSearchParams()
            const searchSettings = getLocalStorage(LocalStorageKey.SearchSettings) ?? {}
            const homePagination = getLocalStorage(LocalStorageKey.HomePagination) ?? {}
            const selectedCategory = getLocalStorage(LocalStorageKey.SelectedCategory)


            params.set('page', homePagination?.page ?? Defaults.Page.toString())
            params.set('limit', homePagination?.limit ?? Defaults.Limit.toString())
            params.set('sortBy', searchSettings?.sortBy ?? 'createdAt')
            params.set('sortOrder', searchSettings?.sortOrder ?? 'desc')

            if (searchSettings.appliedSearch) {
                params.set('search', searchSettings.appliedSearch)
            }

            if (searchSettings.appliedSelectionists?.length) {
                searchSettings.appliedSelectionists.forEach((item: any) => {
                    params.append('selectionistIDs[]', item.id);
                });
            }

            if (searchSettings.appliedTags?.length) {
                searchSettings.appliedTags.forEach((item: any) => {
                    params.append('tagIDs[]', item.id);
                });
            }

            if (selectedCategory) {
                params.set('categoryID', selectedCategory.id)
            }

            if (searchSettings.appliedShowOnly) {
                params.set('state[]', GoodState.Available)
            }

            const res = await fetch(`/api/goods?${params.toString()}`)
            const data = await res.json()

            setGoods(data)
        } finally {
            setLoading(false)
        }
    }

    // Trigger fetchHome.
    useEffect(() => {
        fetchHome()
    }, [pathname, settingsLoaded])

    return (
        <div style={{ padding: 24 }}>
            <h1>{t('Goods')}</h1>

            <SearchBar fetchGoods={fetchHome} settings={settings}/>

            {/* GOODS */}
            {loading ? (
                <Spin />
            ) : (
                <div>


                    <GoodsList goodsData={goodsData} settings={settings}/>
                    <SimplePagination
                        storageKey={LocalStorageKey.HomePagination}
                        current={goodsData?.pagination?.page ?? Defaults.Page}
                        total={goodsData?.pagination?.total ?? 0}
                        pageSize={goodsData?.pagination?.limit ?? Defaults.Limit}
                        callFunc={fetchHome}
                    />
                </div>
            )}
        </div>
    )
}