'use client'

import { DeleteOutlined } from '@ant-design/icons'
import {
    Button,
    Input,
    message,
    Popconfirm,
    Space,
    Table,
    Tag
} from 'antd'
import { useEffect, useState } from 'react'

import SelectionistModal from '@/app/components/goodModals/selectionistModal'
import SimplePagination from '@/app/components/SimplePagination'
import {
    Defaults,
    Language,
    LocalStorageKey
} from '@/app/utils/enums'
import {
    getLocalStorage,
    getTFunc
} from '@/app/utils/helpers'

interface Selectionist {
    id: string;
    nameTID?: string;
    name: Record<string, string>;
    country: string;
    createdAt: string;
    updatedAt: string;
}

export default function SelectionistsTab({
    settings
}: {
    settings: { locale: Language };
}) {
    const t = getTFunc()

    const [data, setData] = useState<{
        selectionists: Selectionist[];
        pagination: {
            page: number;
            limit: number;
            total: number;
        };
    } | null>(null)

    const [loading, setLoading] = useState(false)
    const [search, setSearch] = useState('')

    const [selectedSelectionist, setSelectedSelectionist]
        = useState<Selectionist | null>(null)

    const [isModalOpen, setIsModalOpen]
        = useState(false)

    const pagination = data?.pagination

    const page
        = pagination?.page ?? Defaults.Page

    const limit
        = pagination?.limit ?? Defaults.Limit

    const fetchData = async () => {
        setLoading(true)

        try {
            const params = new URLSearchParams()

            const stored = getLocalStorage(LocalStorageKey.SelectionistPagination)

            params.set(
                'page',
                String(stored?.page ?? Defaults.Page)
            )

            params.set(
                'limit',
                String(stored?.limit ?? Defaults.Limit)
            )

            if (search) {
                params.set('search', search)
            }

            const res = await fetch(
                `/api/selectionists?${params.toString()}`,
                {
                    method: 'GET'
                }
            )

            const json = await res.json()

            setData(json)
        } finally {
            setLoading(false)
        }
    }

    const deleteSelectionist = async (id: string) => {
        try {
            const res = await fetch(
                `/api/admin/selectionists/${id}`,
                {
                    method: 'DELETE'
                }
            )

            const data = await res.json()

            if (res.ok) {
                message.success(data.message)
            } else {
                if (data.message) {
                    message.error(data.message)
                } else if (data.messages) {
                    data.messages.forEach((item: string) =>
                        message.error(item))
                }
            }

            fetchData()
        } catch {
            message.error(t('Failed to delete selectionist'))
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const openEditModal = (selectionist: Selectionist | null) => {
        setSelectedSelectionist(selectionist)
        setIsModalOpen(true)
    }

    const columns = [
        {
            title: '#',
            width: 70,
            render: (
                _: unknown,
                __: unknown,
                index: number
            ) =>
                (page - 1) * limit
                + index
                + 1
        },
        {
            title: t('Name'),
            dataIndex: 'name',
            render: (
                _: unknown,
                record: Selectionist
            ) =>
                record?.name?.[
                    settings.locale
                ] ?? '-'
        },
        {
            title: t('Country'),
            dataIndex: 'country'
        },
        {
            title: t('Created'),
            dataIndex: 'createdAt',
            render: (value: string) =>
                new Date(value).toLocaleDateString()
        },
        {
            title: t('Updated'),
            dataIndex: 'updatedAt',
            render: (value: string) =>
                new Date(value).toLocaleDateString()
        },
        {
            width: 120,
            render: (
                _: unknown,
                record: Selectionist
            ) => (
                <Popconfirm
                    title={t('Delete selectionist?')}
                    okText={t('Yes')}
                    cancelText={t('No')}
                    onConfirm={() =>
                        deleteSelectionist(record.id)
                    }
                    onPopupClick={(e) =>
                        e.stopPropagation()
                    }
                >
                    <Button
                        danger
                        type="link"
                        icon={
                            <DeleteOutlined />
                        }
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >
                        {t('Delete')}
                    </Button>
                </Popconfirm>
            )
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
                    placeholder={t('Search selectionists')}
                    allowClear
                    onChange={(event) => setSearch(event.target.value)}
                    onSearch={(value) => {
                        setSearch(value)
                        fetchData()
                    }}
                    style={{
                        width: 250
                    }}
                />

                <Button
                    type="primary"
                    onClick={() =>
                        openEditModal(null)
                    }
                >
                    {t('Create Selectionist')}
                </Button>

                <Tag>
                    {t('Results')}:{' '}
                    {pagination?.total
                        ?? 0}
                </Tag>
            </Space>

            <Table
                rowKey="id"
                loading={loading}
                scroll={{
                    x: 'max-content'
                }}
                dataSource={
                    data?.selectionists
                    ?? []
                }
                columns={columns}
                pagination={false}
                onRow={(record) => ({
                    onClick: () =>
                        openEditModal(record),
                    style: {
                        cursor:
                            'pointer'
                    }
                })}
            />

            <SelectionistModal
                open={isModalOpen}
                selectionist={
                    selectedSelectionist
                }
                settings={settings}
                onClose={() =>
                    setIsModalOpen(false)
                }
                onSuccess={() => {
                    setIsModalOpen(false)
                    fetchData()
                }}
            />

            <SimplePagination
                storageKey={
                    LocalStorageKey.SelectionistPagination
                }
                current={page}
                total={pagination?.total ?? 0}
                pageSize={limit}
                callFunc={fetchData}
            />
        </div>
    )
}