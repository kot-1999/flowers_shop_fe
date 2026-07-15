'use client'

import { Flex, Spin } from 'antd'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

import { useAuth } from '@/app/components/AuthContent'
import GoodsList from '@/app/components/GoodsList'
import SearchBar from '@/app/components/SearchBar'
import SimplePagination from '@/app/components/SimplePagination'
import { commonFetch } from '@/app/utils/clientFetchFuntions'
import { Defaults, GoodState, LocalStorageKey } from '@/app/utils/enums'
import { fetchSettings, getLocalStorage, getTFunc } from '@/app/utils/helpers'

export default function Categories() {
    const [goodsData, setGoods] = useState<{
        goods: any[]
        pagination: any
    }>({
        goods: [],
        pagination: {}
    })

    const [loading, setLoading] = useState(false)
    const t = getTFunc()

    const [settings, setSettings] = useState<any>(null)
    const [settingsLoaded, setSettingsLoaded] = useState(false)
    const { user } = useAuth()
    const [categoryRes, setCategoryRes] = useState<{ categories: any[] }>({ categories: [] })
    const [selectedCategory, setSelectedCategory] = useState<{ id: string }>(getLocalStorage(LocalStorageKey.SelectedCategory))

    const pathname = usePathname()
    const [, locale] = pathname.split('/')

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
        // const categories = getLocalStorage(LocalStorageKey.)
        loadSettings()
        commonFetch({
            type: 'categories',
            setData: setCategoryRes
        })
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
                    params.append('selectionistIDs[]', item.id)
                })
            }

            if (searchSettings.appliedTags?.length) {
                searchSettings.appliedTags.forEach((item: any) => {
                    params.append('tagIDs[]', item.id)
                })
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
            <Flex
                style={{
                    width: '100%',
                    height: 220,
                    overflow: 'hidden'
                }}
            >
                {categoryRes.categories.map((category: any, index) => {
                    console.log(selectedCategory)
                    return (
                        <Link
                            key={category.id}
                            href={`/${category.name[locale + 'Slug']}`}
                            onClick={() => {
                                setSelectedCategory(category)
                                localStorage.setItem(
                                    LocalStorageKey.SelectedCategory,
                                    JSON.stringify(category)
                                )
                            }}
                            style={{
                                flex: selectedCategory?.id === category.id ? 1.4 : 1,
                                position: 'relative',
                                overflow: 'hidden',
                                transition: 'all .3s ease'
                            }}
                        >
                            <img
                                src={category.coverImage}
                                alt={category.name[locale]}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    clipPath:
                                        index === 0
                                            ? 'polygon(0 0,100% 0,90% 100%,0 100%)'
                                            : index === categoryRes.categories.length - 1
                                                ? 'polygon(10% 0,100% 0,100% 100%,0 100%)'
                                                : 'polygon(10% 0,100% 0,90% 100%,0 100%)',
                                    transform: selectedCategory?.id === category.id ? 'scale(1.08)' : 'scale(1)',
                                    filter: selectedCategory?.id === category.id ? 'none' : 'brightness(.75)',
                                    transition: 'all .3s ease'
                                }}
                            />

                            <div
                                style={{
                                    position: 'absolute',
                                    inset: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#fff',
                                    fontSize: selectedCategory?.id === category.id ? 34 : 28,
                                    fontWeight: 700,
                                    background: selectedCategory?.id === category.id
                                        ? 'rgba(0,0,0,.15)'
                                        : 'rgba(0,0,0,.35)',
                                    transition: 'all .3s ease'
                                }}
                            >
                                {category.name[locale]}
                            </div>
                        </Link>
                    )
                })}
            </Flex>

            <SearchBar fetchGoods={fetchHome} settings={settings}/>

            {/* GOODS */}
            {loading ? (
                <Spin />
            ) : (
                <div>

                    <GoodsList goodsData={goodsData} settings={settings} user={user}/>
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