import {getLocalStorage, removeLocalStorage, setLocalStorage, useT} from "@/app/utils/helpers";
import { LocalStorageKey} from "@/app/utils/enums";
import {useEffect, useState} from 'react'
import {Button, Checkbox, Col, Input, Row, Select, Space } from 'antd'
import {DownOutlined, UpOutlined} from "@ant-design/icons";

export default function SearchBar({ fetchGoods, settings, resetSignal }: any) {
    const t = useT()

    const [appliedSearch, setAppliedSearch] = useState('')

    const [selectionists, setSelectionists] = useState<any[]>([])
    const [appliedSelectionists, setAppliedSelectionists] = useState<any[]>([])

    const [tags, setTags] = useState<any[]>([])
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
    }, [resetSignal])

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
        <div>
        <Space.Compact style={{ width: '100%', marginBottom: 12 }}>
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
                    data: item,
                }))}
                showSearch={{
                    onSearch: handleSelectionistSearch,
                    filterOption: false
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
                    filterOption: false
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
        </div>
)
}