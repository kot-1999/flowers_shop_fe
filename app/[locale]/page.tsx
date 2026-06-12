'use client'

import {useEffect, useState} from 'react'
import {Button, Card, Checkbox, Col, Image, Input, Row, Select, Space, Spin, Tag} from 'antd'
import SimplePagination from '@/app/components/SimplePagination'
import {useSearchParams} from 'next/navigation'
import {fetchSettings, getLocalStorage, setLocalStorage, useT} from '@/app/utils/helpers'
import {GoodState, LocalStorageKey} from "@/app/utils/enums";
import {DownOutlined, UpOutlined} from "@ant-design/icons";

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

    const searchSettings = getLocalStorage(LocalStorageKey.SearchSettings)

    const [appliedSearch, setAppliedSearch] = useState('')

    const [selectionists, setSelectionists] = useState<any[]>([])
    const [appliedSelectionists, setAppliedSelectionists] = useState<any[]>([])

    const [tags, setTags] = useState<any[]>([])
    const [appliedTags, setAppliedTags] = useState<any[]>([])

    const [appliedShowOnly, setAppliedShowOnly] = useState(false)

    const [sortBy, setSortBy] = useState('createdAt')
    const [sortOrder, setSortOrder] = useState('desc')

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

    // Load search settings
    useEffect(() => {
        const searchSettings = getLocalStorage(LocalStorageKey.SearchSettings)

        if (!searchSettings) {
            return
        }

        setAppliedSearch(searchSettings.appliedSearch ?? '')
        setAppliedSelectionists(searchSettings.appliedSelectionists ?? [])
        setAppliedTags(searchSettings.appliedTags ?? [])
        setAppliedShowOnly(searchSettings.appliedShowOnly ?? false)
        setSortBy(searchSettings?.sortBy ?? 'createdAt')
        setSortOrder(searchSettings?.sortOrder ?? 'desc')
    }, [])

    // Save search settings
    useEffect(() => {
        setLocalStorage(
            LocalStorageKey.SearchSettings,
            {
                appliedSearch,
                appliedTags,
                appliedSelectionists,
                appliedShowOnly,
                sortBy,
                sortOrder
            }
        )
    }, [
        appliedSearch,
        appliedTags,
        appliedSelectionists,
        appliedShowOnly,
        sortBy,
        sortOrder
    ])

    // Fetch goods
    const fetchGoods = async () => {
        if (!settings) return

        setLoading(true)

        try {
            const params = new URLSearchParams()

            params.set('page', searchParams.get('page') ?? '1')
            params.set('limit', searchParams.get('limit') ?? '24')
            params.set('sortBy', sortBy)
            params.set('sortOrder', sortOrder)

            if (appliedSearch) {
                params.set('search', appliedSearch)
            }

            if (appliedSelectionists.length) {
                appliedSelectionists.forEach((s) => {
                    params.append('selectionistIDs[]', s.id);
                });
            }

            if (appliedShowOnly) {
                params.set('state[]', GoodState.Available)
            }

            const res = await fetch(`/api/goods?${params.toString()}`)
            const data = await res.json()

            setGoods(data)
        } finally {
            setLoading(false)
        }
    }

    // Trigger goods fetch
    useEffect(() => {
        fetchGoods()
    }, [settings, searchParams])

    const handleSelectionistSearch = async (value?: string) => {
        if (!value && selectionists.length > 0) {
            return;
        }
        try {
            const params = new URLSearchParams()

            if (value) {
                params.set('search', value)
            }

            params.set('limit', '30')

            const res = await fetch(`/api/selectionists?${params.toString()}`);

            const data = await res.json();
            setSelectionists(data.selectionists);
        } catch (error) {
            console.error(error)
        }
    };

    const handleTagSearch = async (value?: string) => {
        if (!value && tags.length > 0) {
            return
        }
        try {
            const params = new URLSearchParams()

            if (value) {
                params.set('search', value)
            }

            params.set('limit', '30')

            const res = await fetch(`/api/tags?${params.toString()}`);

            const data = await res.json();
            setTags(data.tags);
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <div style={{ padding: 24 }}>
            <h1>{t('Goods')}</h1>

            {/* SEARCH INPUT */}
            {/* SEARCH BAR */}
            <Space.Compact style={{ width: '100%', marginBottom: 12 }}>
                <Input
                    placeholder={t('searchGoods')}
                    value={appliedSearch}
                    onChange={(e) => setAppliedSearch(e.target.value)}
                />

                <Button
                    type="primary"
                    onClick={fetchGoods}
                >
                    {t('search')}
                </Button>
            </Space.Compact>

            {/* FILTERS ROW */}
            <Row gutter={[12, 12]} style={{ marginBottom: 12 }}>

                <Col>
                    <Select
                        style={{ width: 260 }}
                        mode="multiple"
                        allowClear
                        placeholder={t('Filter by selectionist')}
                        value={appliedSelectionists.map((item) => ({
                            label: item.name?.[settings?.locale],
                            value: item.id,
                            data: item,
                        }))}
                        showSearch={{
                            onSearch: handleSelectionistSearch,
                        }}
                        onFocus={() => handleSelectionistSearch()}
                        options={selectionists.map((item) => ({
                            label: item.name?.[settings?.locale],
                            value: item.id,
                            data: item,
                        }))}
                        onChange={(values, options) => {
                            setAppliedSelectionists(
                                (options as any[]).map((o) => o.data)
                            )
                        }}
                    />
                </Col>

                <Col>
                    <Select
                        style={{ width: 260 }}
                        mode="multiple"
                        allowClear
                        placeholder={t('Filter by tag')}
                        value={appliedTags.map((item) => ({
                            label: item.name?.[settings?.locale],
                            value: item.id,
                            data: item,
                        }))}
                        showSearch={{
                            onSearch: handleTagSearch,
                        }}
                        onFocus={() => handleTagSearch()}
                        options={tags.map((item) => ({
                            label: item.name?.[settings?.locale],
                            value: item.id,
                            data: item,
                        }))}
                        onChange={(values, options) => {
                            setAppliedTags(
                                (options as any[]).map((o) => o.data)
                            )
                        }}
                    />
                </Col>

                <Col>
                    <Checkbox
                        checked={appliedShowOnly}
                        onChange={(e) => setAppliedShowOnly(e.target.checked)}
                    >
                        {t('Show only available')}
                    </Checkbox>
                </Col>

            </Row>

            {/* SORT ROW */}
            <Space style={{ marginBottom: 16 }}>

                <Select
                    style={{ width: 160 }}
                    value={sortBy}
                    onChange={setSortBy}
                    options={[
                        { value: 'createdAt', label: t('createdAt') },
                        { value: 'name', label: t('name') },
                        { value: 'selectionist', label: t('selectionist') },
                        { value: 'state', label: t('Availability') },
                    ]}
                />

                <Button
                    onClick={() =>
                        setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
                    }
                    icon={sortOrder === 'asc' ? <UpOutlined /> : <DownOutlined />}
                >
                    {sortOrder.toUpperCase()}
                </Button>

            </Space>

            {/* GOODS */}
            {loading ? (
                <Spin />
            ) : (
                <div>
                    <Row gutter={[16, 16]}>
                        {goodsData.goods?.map((good) => (
                            <Col xs={24} sm={12} md={8} key={good.id}>
                                <Card
                                    title={
                                        good.name[settings.locale]
                                    }
                                    extra={<Tag>{good.state}</Tag>}
                                >
                                    {/* IMAGE */}
                                    {good.photos?.[0] && (
                                        <Image
                                            src={good.photos[0]}
                                            alt={good.name?.en ?? 'good'}
                                        />
                                    )}

                                    {/* DESCRIPTION */}
                                    <p>
                                        {good.description[settings.locale]}
                                    </p>

                                    {/* PRICE */}
                                    {good.pricings?.length > 0 && (
                                        <div style={{ overflowX: 'auto' }}>
                                            <Space orientation="vertical" size={[6, 6]} wrap>
                                                {good.pricings.map((p: any) => (
                                                    <div key={p.id}>
                                                        <b>{p.price} €</b>
                                                        {' — '}
                                                        <span>{p.itemType?.name[settings.locale]}</span>
                                                    </div>
                                                ))}
                                            </Space>
                                        </div>
                                    )}

                                    {/* TAGS */}
                                    <Space wrap>
                                        {good.tags?.map((tag: any) => (
                                            <Tag key={tag.id}>
                                                {tag.name[settings?.locale]}
                                            </Tag>
                                        ))}
                                    </Space>

                                    {/* SELECTIONIST */}
                                    {good.selectionist && (
                                        <div>
                                            {good.selectionist.name[settings?.locale]}
                                            {' '}
                                            <Tag>{good.selectionist.country}</Tag>
                                        </div>
                                    )}
                                </Card>
                            </Col>
                        ))}
                    </Row>

                    <SimplePagination
                        pagination={{
                            current: goodsData?.pagination?.page ?? 1,
                            total: goodsData?.pagination?.total ?? 0,
                            perPage:
                                goodsData?.pagination?.limit ?? 24,
                        }}
                    />
                </div>
            )}
        </div>
    )
}