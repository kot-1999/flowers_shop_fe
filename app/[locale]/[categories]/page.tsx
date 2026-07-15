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
import { fetchSettings, getLocalStorage, removeLocalStorage, setLocalStorage } from '@/app/utils/helpers'

export default function Categories() {
    const [goodsData, setGoods] = useState<{
        goods: any[]
        pagination: any
    }>({
        goods: [],
        pagination: {}
    })

    const [loading, setLoading] = useState(false)

    const [settings, setSettings] = useState<any>(null)
    const [settingsLoaded, setSettingsLoaded] = useState(false)
    const { user } = useAuth()
    const [categoryRes, setCategoryRes] = useState<{ categories: any[] }>({ categories: [] })
    const [hoveredCategory, setHoveredCategory] = useState<string>()
    const pathname = usePathname()
    const [, locale, currentSlug] = pathname.split('/')

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
            console.log(selectedCategory)
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
                    height: 240,
                    overflow: 'hidden',
                    borderRadius: 16
                }}
            >
                {categoryRes.categories.map((category: any, index) => {
                    const decodedSlug = decodeURIComponent(currentSlug)

                    const active = category.name[locale + 'Slug'] === decodedSlug
                        || hoveredCategory === category.id

                    return (
                        <Link
                            key={category.id}
                            href={`/${category.name[locale + 'Slug']}`}
                            onMouseEnter={() => setHoveredCategory(category.id)}
                            onMouseLeave={() => setHoveredCategory(undefined)}
                            onClick={() => {
                                removeLocalStorage(LocalStorageKey.SearchSettings)
                                removeLocalStorage(LocalStorageKey.HomePagination)
                                removeLocalStorage(LocalStorageKey.SelectedCategory)
                                setLocalStorage(LocalStorageKey.SelectedCategory, category)
                            }}
                            style={{
                                flex: active ? 1.35 : 1,
                                position: 'relative',
                                overflow: 'hidden',
                                transition: 'all .35s ease'
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
                                    transform: active
                                        ? 'scale(1.1)'
                                        : 'scale(1)',
                                    filter: active
                                        ? 'brightness(.95)'
                                        : 'brightness(.65)',
                                    transition: 'all .35s ease'
                                }}
                            />

                            <div
                                style={{
                                    position: 'absolute',
                                    inset: 0,

                                    display: 'flex',
                                    alignItems: 'flex-end',
                                    padding: 28,
                                    color: '#fff'
                                }}
                            >
                                <div
                                    style={{
                                        width: '100%',
                                        transform: active
                                            ? 'translateY(0)'
                                            : 'translateY(22px)',
                                        transition: '.35s'
                                    }}
                                >
                                    <div
                                        style={{
                                            fontSize: active ? 34 : 28,
                                            fontWeight: 700,
                                            lineHeight: 1.1
                                        }}
                                    >
                                        {category.name[locale]}
                                    </div>

                                    <div
                                        style={{
                                            width: active ? 72 : 40,
                                            height: 3,
                                            background: '#fff',
                                            borderRadius: 999,
                                            marginTop: 10,
                                            marginBottom: 12,
                                            transition: '.35s'
                                        }}
                                    />

                                    <div
                                        style={{
                                            opacity: active ? 1 : 0,
                                            maxHeight: active ? 80 : 0,
                                            overflow: 'hidden',
                                            fontSize: 14,
                                            lineHeight: 1.5,
                                            color: 'rgba(255,255,255,.88)',
                                            transition: 'all .35s'
                                        }}
                                    >
                                        {category.description?.[locale]}
                                    </div>
                                </div>
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