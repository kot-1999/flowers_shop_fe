'use client'

import {useEffect, useState} from 'react'
import {Button, List, Spin} from 'antd'
import SimplePagination from '@/app/components/SimplePagination'
import {useSearchParams} from 'next/navigation'
import {fetchSettings, getLocalStorage, removeLocalStorage, setLocalStorage, useT} from '@/app/utils/helpers'
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

    const [categories, setCategories] = useState<any>([])
    const [categoriesLoaded, setCategoriesLoaded] = useState(false)
    const [searchResetSignal, setSearchResetSignal] = useState(0)

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

    const loadCategories = async () => {
        try {
            const res = await fetch(`/api/categories`)
            const data = await res.json()

            setCategories(data.categories)
        } catch (err) {
            console.error(err)
        } finally {
            setCategoriesLoaded(true)
        }
    }

    useEffect(() => {
        loadCategories()
    }, [])


    // Fetch goods
    const fetchHome = async () => {
        if (!settings) return

        setLoading(true)

        try {
            // const categoriesRes = await fetch(`/api/categories`)
            // const categoriesData = await res.json()
            //
            // setCategories(categoriesData)

            const params = new URLSearchParams()
            const searchSettings = getLocalStorage(LocalStorageKey.SearchSettings) ?? {}
            const homePagination = getLocalStorage(LocalStorageKey.HomePagination) ?? {}
            const selectedCategory = getLocalStorage(LocalStorageKey.SelectedCategory)


            console.log('!!!!!!!', searchSettings)
            params.set('page', homePagination?.page ?? '1')
            params.set('limit', homePagination?.limit ?? '24')
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

            if (selectedCategory) {
                params.set('categoryID', selectedCategory)
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

    // Trigger fetchHome. Runs after categories are loaded
    useEffect(() => {
        fetchHome()
    }, [categoriesLoaded])

    const onCategoryChange = (categoryID: string | null) => {
        if (!categoryID) {
            removeLocalStorage(LocalStorageKey.SelectedCategory)
        } else {
            setLocalStorage(LocalStorageKey.SelectedCategory, categoryID)
        }
        removeLocalStorage(LocalStorageKey.SearchSettings)
        setSearchResetSignal(prev => prev + 1)

        fetchHome()
    }

    return (
        <div style={{ padding: 24 }}>
            <h1>{t('Goods')}</h1>

            {!categoriesLoaded ? (
                <Spin />
            ) : (
                <List
                    dataSource={[
                        { id: '', name: { [settings.locale]: t('All categories') } },
                        ...categories,
                    ]}
                    renderItem={(item: any) => {
                        const selectedCategory = getLocalStorage(LocalStorageKey.SelectedCategory)

                        const active = selectedCategory === item.id

                        return (
                            <List.Item style={{ padding: 0 }}>
                                <Button
                                    block
                                    type={active ? 'primary' : 'text'}
                                    onClick={() =>
                                        onCategoryChange(item.id || null)
                                    }
                                >
                                    {item.name[settings.locale]}
                                </Button>
                            </List.Item>
                        )
                    }}
                />
            )}


            <SearchBar fetchGoods={fetchHome} settings={settings} resetSignal={searchResetSignal} />

            {/* GOODS */}
            {loading ? (
                <Spin />
            ) : (
                <div>


                    <GoodsList goodsData={goodsData} settings={settings}/>
                    <SimplePagination
                        storageKey={LocalStorageKey.HomePagination}
                        current={goodsData?.pagination?.page ?? 1}
                        total={goodsData?.pagination?.total ?? 0}
                        pageSize={goodsData?.pagination?.limit ?? 24}
                        callFunc={fetchHome}
                    />
                </div>
            )}
        </div>
    )
}