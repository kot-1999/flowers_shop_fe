import { DeleteOutlined, UndoOutlined } from '@ant-design/icons'
import { Button, Input, message, Space, Table, Tag, Popconfirm } from 'antd'
import { useEffect, useState } from 'react'

import TagModal from '@/app/components/goodModals/TagModal'
import SimplePagination from '@/app/components/SimplePagination'
import { commonFetch } from '@/app/utils/clientFetchFuntions'
import { Defaults, Language, LocalStorageKey } from '@/app/utils/enums'
import {
    checkRes,
    getTFunc,
    removeLocalStorage
} from '@/app/utils/helpers'

interface TagEntity {
    id: string
    name: Record<Language, string> & { id: string }
    createdAt: string
    updatedAt: string
    deletedAt?: string | null
}

interface Props {
    settings: { locale: Language }
}

export default function TagsTab({ settings }: Props) {
    const t = getTFunc()

    const [data, setData] = useState<{
        tags: TagEntity[]
        pagination: {
            page: number
            limit: number
            total: number
        }
    } | null>(null)

    const [loading, setLoading] = useState(false)
    const [search, setSearch] = useState('')

    const [selectedTag, setSelectedTag] = useState<TagEntity | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)

    const pagination = data?.pagination
    const page = pagination?.page ?? Defaults.Page
    const limit = pagination?.limit ?? Defaults.Limit

    const updateTag = async (body: Record<string, any>) => {
        try {
            const res = await fetch('/api/admin/tags', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            })

            const data = await res.json()

            if (res.ok) {
                message.success(data.message)
                commonFetch({
                    type: 'adminTags',
                    setLoading,
                    search,
                    setData,
                    paginationKey: LocalStorageKey.TagPagination
                })
            } else {
                if (data.message) {
                    message.error(data.message)
                } else if (data.messages) {
                    data.messages.forEach((item: string) =>
                        message.error(item))
                }
            }
        } catch {
            message.error(t('Operation failed'))
        }
    }

    const toggleRestore = (tag: TagEntity) => {
        updateTag({
            tagID: tag.id,
            nameTID: tag.name.id,
            restore: true
        })
    }

    const deleteTag = async (id: string) => {
        try {
            const res = await fetch(`/api/admin/tags/${id}`, {
                method: 'DELETE'
            })

            const data = await res.json()

            const isSuccess = await checkRes(res, data, t('Failed to delete tag'))

            if (isSuccess) {
                commonFetch({
                    type: 'adminTags',
                    setLoading,
                    search,
                    setData,
                    paginationKey: LocalStorageKey.TagPagination
                })
            }
        } catch {
            message.error(t('Failed to delete tag'))
        }
    }

    useEffect(() => {
        commonFetch({
            type: 'adminTags',
            setLoading,
            search,
            setData,
            paginationKey: LocalStorageKey.TagPagination
        })
    }, [])

    const openModal = (tag: TagEntity | null) => {
        setSelectedTag(tag)
        setIsModalOpen(true)
    }

    const columns = [
        {
            title: '#',
            width: 70,
            render: (_: any, __: any, index: number) =>
                (page - 1) * limit + index + 1
        },
        {
            title: t('Name'),
            render: (_: any, record: TagEntity) =>
                record.name?.[settings.locale] ?? '-'
        },
        {
            title: t('Status'),
            width: 120,
            render: (_: any, record: TagEntity) =>
                record.deletedAt ? (
                    <Tag color="red">{t('Deleted')}</Tag>
                ) : (
                    <Tag color="green">{t('Active')}</Tag>
                )
        },
        {
            title: t('Created'),
            render: (_: any, record: TagEntity) =>
                new Date(record.createdAt).toLocaleDateString()
        },
        {
            title: t('Updated'),
            render: (_: any, record: TagEntity) =>
                new Date(record.updatedAt).toLocaleDateString()
        },
        {
            width: 120,
            render: (_: any, record: TagEntity) =>
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
                        title={t('Delete tag?')}
                        okText={t('Yes')}
                        cancelText={t('No')}
                        onConfirm={(e) => {
                            e?.stopPropagation?.()
                            deleteTag(record.id)
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
                    placeholder={t('Search tags')}
                    allowClear
                    onChange={(e) => setSearch(e.target.value)}
                    onSearch={() => {
                        removeLocalStorage(LocalStorageKey.TagPagination)
                        commonFetch({
                            type: 'adminTags',
                            setLoading,
                            search,
                            setData,
                            paginationKey: LocalStorageKey.TagPagination
                        })
                    }}
                    style={{ width: 250 }}
                />

                <Button type="primary" onClick={() => openModal(null)}>
                    {t('Add Tag')}
                </Button>

                <Tag>
                    {t('Results')}: {pagination?.total ?? 0}
                </Tag>
            </Space>

            <Table
                rowKey="id"
                loading={loading}
                dataSource={data?.tags ?? []}
                columns={columns}
                pagination={false}
                scroll={{ x: 'max-content' }}
                onRow={(record) => ({
                    onClick: () => openModal(record),
                    style: { cursor: 'pointer' }
                })}
            />

            <SimplePagination
                storageKey={LocalStorageKey.TagPagination}
                current={page}
                total={pagination?.total ?? 0}
                pageSize={limit}
                callFunc={() => commonFetch({
                    type: 'adminTags',
                    setLoading,
                    search,
                    setData,
                    paginationKey: LocalStorageKey.TagPagination
                })}
            />

            <TagModal
                open={isModalOpen}
                tag={selectedTag}
                settings={settings}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => {
                    setIsModalOpen(false)
                    commonFetch({
                        type: 'adminTags',
                        setLoading,
                        search,
                        setData,
                        paginationKey: LocalStorageKey.TagPagination
                    })
                }}
            />
        </div>
    )
}