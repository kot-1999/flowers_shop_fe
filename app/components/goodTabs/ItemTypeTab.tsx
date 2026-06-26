import { DeleteOutlined } from '@ant-design/icons'
import { Button, Input, message, Popconfirm, Space, Table, Tag } from 'antd'
import { useEffect, useState } from 'react'

import ItemTypeModal from '@/app/components/goodModals/ItemTypeModal'
import SimplePagination from '@/app/components/SimplePagination'
import { commonFetch } from '@/app/utils/clientFetchFuntions'
import { Defaults, Language, LocalStorageKey } from '@/app/utils/enums'
import { checkRes, getTFunc, removeLocalStorage } from '@/app/utils/helpers'

interface ItemType {
    id: string;
    name: Record<string, string>;
    weight: number;
    createdAt: string;
    updatedAt: string;
}

export default function ItemTypesTab({
    settings
}: {
    settings: { locale: Language };
}) {
    const t = getTFunc()

    const [data, setData] = useState<{
        itemTypes: ItemType[];
        pagination: {
            page: number;
            limit: number;
            total: number;
        };
    } | null>(null)

    const [loading, setLoading] = useState(false)
    const [search, setSearch] = useState('')
    const [selectedItemType, setSelectedItemType] = useState<ItemType | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)

    const pagination = data?.pagination
    const page = pagination?.page ?? Defaults.Page
    const limit = pagination?.limit ?? Defaults.Limit

    const deleteItemType = async (id: string) => {
        try {
            const res = await fetch(`/api/admin/item-types/${id}`, {
                method: 'DELETE'
            })

            const data = await res.json()

            const isSuccess = await checkRes(res, data, t('Failed to delete item Type'))

            if (isSuccess) {
                commonFetch({
                    search,
                    setLoading: setLoading,
                    setData: setData,
                    type: 'adminItemTypes',
                    paginationKey: LocalStorageKey.ItemTypePagination
                })
            }
            
        } catch {
            message.error(t('Failed to delete item Type'))
        }
    }

    useEffect(() => {
        commonFetch({
            search,
            setLoading: setLoading,
            setData: setData,
            type: 'adminItemTypes',
            paginationKey: LocalStorageKey.ItemTypePagination
        })
    }, [])

    const columns = [
        {
            title: '#',
            width: 70,
            render: (_: any, __: any, index: number) => (page - 1) * limit + index + 1
        },
        {
            title: t('Name'),
            dataIndex: 'name',
            render: (_: any, record: ItemType) => record?.name?.[settings.locale] ?? '-'
        },
        {
            title: t('Weight'),
            dataIndex: 'weight',
            width: 120
        },
        {
            title: t('Created'),
            dataIndex: 'createdAt',
            render: (val: string) => new Date(val).toLocaleDateString()
        },
        {
            title: t('Updated'),
            dataIndex: 'updatedAt',
            render: (val: string) => new Date(val).toLocaleDateString()
        },
        {
            width: 120,
            render: (_: any, record: ItemType) => (
                <Popconfirm
                    title={t('Delete item type?')}
                    okText={t('Yes')}
                    cancelText={t('No')}
                    onConfirm={() => deleteItemType(record.id)}
                    onPopupClick={(e) => e.stopPropagation()}
                >
                    <Button
                        danger
                        type="link"
                        icon={<DeleteOutlined />}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {t('Delete')}
                    </Button>
                </Popconfirm>
            )
        }
    ]

    const openEditModal = (itemType: ItemType | null) => {
        setSelectedItemType(itemType)
        setIsModalOpen(true)
    }

    return (
        <div>
            {/* Actions */}
            <Space
                wrap
                size={[12, 12]}
                style={{
                    width: '100%',
                    marginBottom: 16
                }}
            >
                <Input.Search
                    placeholder={t('Search product types')}
                    allowClear
                    onChange={(event) => setSearch(event.target.value)}
                    onSearch={(value) => {
                        setSearch(value)
                        removeLocalStorage(LocalStorageKey.ItemTypePagination)
                        commonFetch({
                            search,
                            setLoading: setLoading,
                            setData: setData,
                            type: 'adminItemTypes',
                            paginationKey: LocalStorageKey.ItemTypePagination
                        })
                    }}
                    style={{ width: 250 }}
                />

                <Button
                    type="primary"
                    onClick={() => openEditModal(null)}
                >
                    {t('Add Product Type')}
                </Button>

                <Tag>
                    {t('Results')}: {pagination?.total ?? 0}
                </Tag>
            </Space>

            {/* Table */}
            <Table
                rowKey="id"
                loading={loading}
                scroll={{ x: 'max-content' }}
                dataSource={data?.itemTypes ?? []}
                columns={columns}
                pagination={false}
                onRow={(record) => ({
                    onClick: () => openEditModal(record),
                    style: { cursor: 'pointer' }
                })}
            />

            <ItemTypeModal
                open={isModalOpen}
                itemType={selectedItemType}
                settings={settings}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => {
                    setIsModalOpen(false)
                    commonFetch({
                        search,
                        setLoading: setLoading,
                        setData: setData,
                        type: 'adminItemTypes',
                        paginationKey: LocalStorageKey.ItemTypePagination
                    })
                }}
            />

            {/* Pagination */}
            <SimplePagination
                storageKey={LocalStorageKey.ItemTypePagination}
                current={page}
                total={pagination?.total ?? 0}
                pageSize={limit}
                callFunc={() => commonFetch({
                    search,
                    setLoading: setLoading,
                    setData: setData,
                    type: 'adminItemTypes',
                    paginationKey: LocalStorageKey.ItemTypePagination
                })}
            />
        </div>
    )
}