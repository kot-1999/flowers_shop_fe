import { DownOutlined, UpOutlined } from '@ant-design/icons'
import { Button, Checkbox, Col, Input, Row, Select, Space } from 'antd'
import { useEffect, useState } from 'react'

import { commonFetch } from '@/app/utils/clientFetchFuntions'
import { LocalStorageKey } from '@/app/utils/enums'
import { getLocalStorage, removeLocalStorage, setLocalStorage, getTFunc } from '@/app/utils/helpers'

export default function SearchBar({ fetchGoods, settings }: any) {
    const t = getTFunc()

    const [appliedSearch, setAppliedSearch] = useState('')

    const [selectionistRes, setSelectionistRes] = useState<{ selectionists: any[]}>({ selectionists: [] })
    const [appliedSelectionists, setAppliedSelectionists] = useState<any[]>([])

    const [tagRes, setTagRes] = useState<{ tags: any[] }>({ tags: [] })
    const [appliedTags, setAppliedTags] = useState<any[]>([])

    const [appliedShowOnly, setAppliedShowOnly] = useState(false)

    const [sortBy, setSortBy] = useState('createdAt')
    const [sortOrder, setSortOrder] = useState('desc')

    // Load search settings
    useEffect(() => {
        const searchSettings = getLocalStorage(LocalStorageKey.SearchSettings)

        if (!searchSettings) {
            setAppliedSearch('')
            setAppliedSelectionists([])
            setAppliedTags([])
            setAppliedShowOnly(false)
            setSortBy('createdAt')
            setSortOrder('desc')
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

    return (
        <div>
            <Space.Compact style={{
                width: '100%',
                marginBottom: 12 
            }}>
                <Input
                    placeholder={t('searchGoods')}
                    value={appliedSearch}
                    onChange={(e) => setAppliedSearch(e.target.value)}
                />

                <Button
                    type="primary"
                    onClick={() => {
                        removeLocalStorage(LocalStorageKey.HomePagination)
                        fetchGoods()
                    }}
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
                            data: item
                        }))}
                        showSearch={{
                            onSearch: (value) => commonFetch({
                                type: 'selectionists',
                                setData: setSelectionistRes,
                                search: value,
                                categoryKey: LocalStorageKey.SelectedCategory
                            }),
                            filterOption: false
                        }}
                        onFocus={() => !selectionistRes.selectionists?.length && commonFetch({
                            type: 'selectionists',
                            setData: setSelectionistRes,
                            categoryKey: LocalStorageKey.SelectedCategory
                        })}
                        options={selectionistRes.selectionists?.map((item) => ({
                            label: item.name?.[settings?.locale],
                            value: item.id,
                            data: item
                        }))}
                        onChange={(values, options) => {
                            setAppliedSelectionists((options as any[]).map((o) => o.data))
                        }}
                    />
                </Col>

                <Col>
                    <Select
                        style={{ width: 260 }}
                        mode="multiple"
                        allowClear
                        placeholder={t('Filter by tag')}
                        value={appliedTags?.map((item) => ({
                            label: item?.name?.[settings?.locale],
                            value: item?.id,
                            data: item
                        }))}
                        showSearch={{
                            onSearch: (value) => commonFetch({
                                type: 'tags',
                                setData: setTagRes,
                                search: value,
                                categoryKey: LocalStorageKey.SelectedCategory
                            }),
                            filterOption: false
                        }}
                        onFocus={() => !tagRes.tags?.length && commonFetch({
                            type: 'tags',
                            setData: setTagRes,
                            categoryKey: LocalStorageKey.SelectedCategory
                        })}
                        options={tagRes.tags?.map((item) => ({
                            label: item.name?.[settings?.locale],
                            value: item.id,
                            data: item
                        }))}
                        onChange={(values, options) => {
                            setAppliedTags((options as any[])?.map((o) => o.data))
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
                        {
                            value: 'createdAt',
                            label: t('createdAt') 
                        },
                        {
                            value: 'name',
                            label: t('name') 
                        },
                        {
                            value: 'selectionist',
                            label: t('selectionist') 
                        },
                        {
                            value: 'state',
                            label: t('Availability') 
                        }
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
        </div>
    )
}