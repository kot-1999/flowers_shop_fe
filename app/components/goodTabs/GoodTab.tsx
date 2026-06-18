'use client'

import { Button, Image, Input, Space, Table, Tag } from 'antd'
import { useEffect, useState } from 'react'

import GoodModal from '@/app/components/goodModals/GoodModal'
import SimplePagination from '@/app/components/SimplePagination'
import { Defaults, GoodState, Language, LocalStorageKey } from '@/app/utils/enums'
import { getLocalStorage, getTFunc, removeLocalStorage } from '@/app/utils/helpers'

// import GoodModal from '@/app/components/goodModals/GoodModal'

interface GoodEntity {
    id: string
    photos: string[]
    name: Record<Language, string>
    description: Record<Language, string>
    state: GoodState
    createdAt: string
    updatedAt: string

    pricings?: {
        id: string
        price: number
        quantity: number
        itemType?: {
            id: string
            name: Record<Language, string>
        }
    }[]
}

interface Props {
    settings: { locale: Language }
}

export default function GoodsTab({ settings }: Props) {
    const t = getTFunc()

    const [data, setData] = useState<{
        goods: GoodEntity[]
        pagination: {
            page: number
            limit: number
            total: number
        }
    } | null>(null)

    const [loading, setLoading] = useState(false)
    const [search, setSearch] = useState('')

    const [selectedGood, setSelectedGood] = useState<GoodEntity | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)

    const pagination = data?.pagination
    const page = pagination?.page ?? Defaults.Page
    const limit = pagination?.limit ?? Defaults.Limit

    const fetchData = async () => {
        setLoading(true)

        try {
            const params = new URLSearchParams()

            const stored = getLocalStorage(LocalStorageKey.GoodPagination)

            params.set('page', String(stored?.page ?? Defaults.Page))
            params.set('limit', String(stored?.limit ?? Defaults.Limit))

            if (search) {
                params.set('search', search)
            }

            const res = await fetch(`/api/goods?${params.toString()}`)
            const json = await res.json()

            setData(json)
        } finally {
            setLoading(false)
        }
    }

    const openModal = (good: GoodEntity | null) => {
        setSelectedGood(good)
        setIsModalOpen(true)
    }

    const getStateColor = (goodState: GoodState) => {
        switch (goodState) {
        case GoodState.Available:
            return 'green'
        case GoodState.Awaiting:
            return 'yellow'
        default:
            return 'red'
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const columns = [
        {
            title: '#',
            width: 70,
            render: (_: any, __: any, index: number) =>
                (page - 1) * limit + index + 1
        },
        {
            title: t('Name'),
            render: (_: any, record: GoodEntity) =>
                record.name?.[settings.locale] ?? '-'
        },
        {
            title: t('Photos'),
            width: 120,
            render: (_: any, record: GoodEntity) =>
                record.photos?.length ? (
                    <Image
                        src={record.photos[0]}
                        style={{
                            width: 100,
                            height: 100,
                            objectFit: 'cover'
                        }}
                    />
                ) : '-'
        },
        {
            title: t('State'),
            width: 120,
            render: (_: any, record: GoodEntity) => (
                <Tag color={getStateColor(record.state)}>
                    {record.state}
                </Tag>
            )
        },
        {
            title: t('Pricings'),
            render: (_: any, record: GoodEntity) =>
                record.pricings?.length ? (
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 4 
                    }}>
                        {record.pricings.map((p) => (
                            <div key={p.id}>
                                {p.price} × {p.quantity}{' '}
                                ({p.itemType?.name?.[settings.locale] ?? '-'})
                            </div>
                        ))}
                    </div>
                ) : (
                    '-'
                )
        },
        {
            title: t('Created'),
            render: (_: any, record: GoodEntity) =>
                new Date(record.createdAt).toLocaleDateString()
        },
        {
            title: t('Updated'),
            render: (_: any, record: GoodEntity) =>
                new Date(record.updatedAt).toLocaleDateString()
        }
    ]

    return (
        <div>
            <Space
                wrap
                size={[12, 12]}
                style={{
                    width: '100%',
                    marginBottom: 16 
                }}
            >
                <Input.Search
                    placeholder={t('Search goods')}
                    allowClear
                    onChange={(e) => setSearch(e.target.value)}
                    onSearch={() => {
                        removeLocalStorage(LocalStorageKey.GoodPagination)
                        fetchData()
                    }}
                    style={{ width: 250 }}
                />

                <Button type="primary" onClick={() => openModal(null)}>
                    {t('Add Good')}
                </Button>

                <Tag>
                    {t('Results')}: {pagination?.total ?? 0}
                </Tag>
            </Space>

            <Table
                rowKey="id"
                loading={loading}
                dataSource={data?.goods ?? []}
                columns={columns}
                pagination={false}
                scroll={{ x: 'max-content' }}
                onRow={(record) => ({
                    onClick: () => openModal(record),
                    style: { cursor: 'pointer' }
                })}
            />

            <GoodModal
                open={isModalOpen}
                good={selectedGood}
                settings={settings}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => {
                    setIsModalOpen(false)
                    fetchData()
                }}
            />

            <SimplePagination
                storageKey={LocalStorageKey.GoodPagination}
                current={page}
                total={pagination?.total ?? 0}
                pageSize={limit}
                callFunc={fetchData}
            />
        </div>
    )
}