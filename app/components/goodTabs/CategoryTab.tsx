import { DeleteOutlined, UndoOutlined } from '@ant-design/icons'
import { Button, Input, message, Space, Table, Tag, Popconfirm, Image } from 'antd'
import { useEffect, useState } from 'react'

import CategoryModal from '@/app/components/goodModals/CategoryModal'
import { commonFetch } from '@/app/utils/clientFetchFuntions'
import {
    Defaults,
    Language
} from '@/app/utils/enums'
import { getTFunc } from '@/app/utils/helpers'

interface CategoryEntity {
    id: string
    coverImage?: string | null
    name: Record<Language, string> & { id: string }
    description: Record<Language, string> & { id: string }
    createdAt: string
    updatedAt: string
    deletedAt?: string | null
}

interface Props {
    settings: { locale: Language }
}

export default function CategoriesTab({ settings }: Props) {
    const t = getTFunc()

    const [data, setData] = useState<{
        categories: CategoryEntity[]
        pagination: {
            page: number
            limit: number
            total: number
        }
    } | null>(null)

    const [loading, setLoading] = useState(false)
    const [search, setSearch] = useState('')

    const [selectedCategory, setSelectedCategory] = useState<CategoryEntity | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)

    const pagination = data?.pagination
    const page = pagination?.page ?? Defaults.Page
    const limit = pagination?.limit ?? Defaults.Limit

    const updateCategory = async (body: Record<string, any>) => {
        try {
            const res = await fetch('/api/admin/categories', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            })

            const data = await res.json()

            if (res.ok) {
                message.success(data.message)
                commonFetch({
                    search,
                    setLoading: setLoading,
                    setData: setData,
                    type: 'adminCategories'
                })
            } else {
                if (data.message) {
                    message.error(data.message)
                } else if (data.messages) {
                    data.messages.forEach((item: string) => message.error(item))
                }
            }
        } catch {
            message.error(t('Operation failed'))
        }
    }

    const toggleRestore = (category: CategoryEntity) => {
        updateCategory({
            categoryID: category.id,
            nameTID: category.name.id,
            descriptionTID: category.description.id,
            restore: true
        })
    }

    const deleteCategory = async (id: string) => {
        try {
            const res = await fetch(`/api/admin/categories/${id}`, {
                method: 'DELETE'
            })

            const json = await res.json()

            if (res.ok) {
                message.success(json.message)
                commonFetch({
                    search,
                    setLoading: setLoading,
                    setData: setData,
                    type: 'adminCategories'
                })
            } else {
                message.error(json.message || t('Failed to delete category'))
            }
        } catch {
            message.error(t('Failed to delete category'))
        }
    }

    const openModal = (category: CategoryEntity | null) => {
        setSelectedCategory(category)
        setIsModalOpen(true)
    }

    useEffect(() => {
        commonFetch({
            search,
            setLoading: setLoading,
            setData: setData,
            type: 'adminCategories'
        })
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
            render: (_: any, record: CategoryEntity) =>
                record.name?.[settings.locale] ?? '-'
        },
        {
            title: t('Description'),
            render: (_: any, record: CategoryEntity) =>
                record.description?.[settings.locale] ?? '-'
        },
        {
            title: t('Cover'),
            width: 120,
            render: (_: any, record: CategoryEntity) =>
                record.coverImage ? (
                    <Image
                        src={record.coverImage}
                        style={{
                            width: 100,
                            height: 100,
                            objectFit: 'cover'
                        }}
                    />
                ) : '-'
        },
        {
            title: t('Status'),
            width: 120,
            render: (_: any, record: CategoryEntity) =>
                record.deletedAt ? (
                    <Tag color="red">{t('Deleted')}</Tag>
                ) : (
                    <Tag color="green">{t('Active')}</Tag>
                )
        },
        {
            title: t('Created'),
            render: (_: any, record: CategoryEntity) =>
                new Date(record.createdAt).toLocaleDateString()
        },
        {
            title: t('Updated'),
            render: (_: any, record: CategoryEntity) =>
                new Date(record.updatedAt).toLocaleDateString()
        },
        {
            width: 140,
            render: (_: any, record: CategoryEntity) =>
                record.deletedAt ? (
                    <Button
                        type="link"
                        icon={<UndoOutlined />}
                        onClick={(e) => {
                            e.stopPropagation()
                            toggleRestore(record)
                        }}
                    >
                        {t('Restore')}
                    </Button>
                ) : (
                    <Popconfirm
                        title={t('Delete category?')}
                        okText={t('Yes')}
                        cancelText={t('No')}
                        onConfirm={(e) => {
                            e?.stopPropagation?.()
                            deleteCategory(record.id)
                        }}
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
                    placeholder={t('Search categories')}
                    allowClear
                    onChange={(e) => setSearch(e.target.value)}
                    onSearch={() => {
                        commonFetch({
                            search,
                            setLoading: setLoading,
                            setData: setData,
                            type: 'adminCategories'
                        })
                    }}
                    style={{ width: 250 }}
                />

                <Button type="primary" onClick={() => openModal(null)}>
                    {t('Add Category')}
                </Button>

                <Tag>
                    {t('Results')}: {pagination?.total ?? 0}
                </Tag>
            </Space>

            <Table
                rowKey="id"
                loading={loading}
                dataSource={data?.categories ?? []}
                columns={columns}
                pagination={false}
                scroll={{ x: 'max-content' }}
                onRow={(record) => ({
                    onClick: () => openModal(record),
                    style: { cursor: 'pointer' }
                })}
            />

            <CategoryModal
                open={isModalOpen}
                category={selectedCategory}
                settings={settings}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => {
                    setIsModalOpen(false)
                    commonFetch({
                        search,
                        setLoading: setLoading,
                        setData: setData,
                        type: 'adminCategories'
                    })
                }}
            />
        </div>
    )
}