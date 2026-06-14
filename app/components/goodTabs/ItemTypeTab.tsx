import { useEffect, useState } from 'react';
import {Button, Input, message, Popconfirm, Space, Table, Tag} from 'antd';

import {Defaults, Language, LocalStorageKey} from "@/app/utils/enums";
import {getLocalStorage, useT} from "@/app/utils/helpers";
import SimplePagination from "@/app/components/SimplePagination";
import {DeleteOutlined} from "@ant-design/icons";
import ItemTypeModal from "@/app/components/goodModals/ItemTypeModal";

type ItemType = {
    id: string;
    name: Record<string, string>;
    weight: number;
    createdAt: string;
    updatedAt: string;
};

export default function ItemTypesTab({
                                         settings,
                                     }: {
    settings: { locale: Language };
}) {
    const t = useT();

    const [data, setData] = useState<{
        itemTypes: ItemType[];
        pagination: {
            page: number;
            limit: number;
            total: number;
        };
    } | null>(null);

    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [selectedItemType, setSelectedItemType] = useState<ItemType | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const pagination = data?.pagination;
    const page = pagination?.page ?? Defaults.Page;
    const limit = pagination?.limit ?? Defaults.Limit;

    const fetchData = async () => {
        setLoading(true);

        try {
            const params = new URLSearchParams();

            const stored = getLocalStorage(LocalStorageKey.ItemTypePagination);

            params.set('page', String(stored?.page ?? Defaults.Page));
            params.set('limit', String(stored?.limit ?? Defaults.Limit));

            if (search) {
                params.set('search', search);
            }

            const res = await fetch(
                `/api/admin/item-types?${params.toString()}`,
                { method: 'GET' }
            );

            const data = await res.json();
            setData(data);

            console.log(data)
        } finally {
            setLoading(false);
        }
    };

    const deleteItemType = async (id: string) => {
        try {
            const res = await fetch(`/api/admin/item-types/${id}`, {
                method: 'DELETE',
            });

            const data = await res.json();

            if (res.ok) {
                message.success(data.message);
            } else {
                if (data.message) {
                    message.error(data.message);
                } else if (data.messages) {
                    data.messages.forEach((item: string) => message.error(item))
                }
            }

            fetchData();
        } catch (e) {
            message.error(t('Failed to delete item Type'));
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const columns = [
        {
            title: '#',
            width: 70,
            render: (_: any, __: any, index: number) => (page - 1) * limit + index + 1,
        },
        {
            title: t('Name'),
            dataIndex: 'name',
            render: (_: any, record: ItemType) => record?.name?.[settings.locale] ?? '-',
        },
        {
            title: t('Weight'),
            dataIndex: 'weight',
            width: 120,
        },
        {
            title: t('Created'),
            dataIndex: 'createdAt',
            render: (val: string) => new Date(val).toLocaleDateString(),
        },
        {
            title: t('Updated'),
            dataIndex: 'updatedAt',
            render: (val: string) => new Date(val).toLocaleDateString(),
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
            ),
        }
    ];

    const openEditModal = (itemType: ItemType | null) => {
        setSelectedItemType(itemType);
        setIsModalOpen(true);
    };

    return (
        <div>
            {/* Actions */}
            <Space
                wrap
                size={[12, 12]}
                style={{
                    width: '100%',
                    marginBottom: 16,
                }}
            >
                <Input.Search
                    placeholder={t('Search product types')}
                    allowClear
                    onSearch={(value) => {
                        setSearch(value);
                        fetchData();
                    }}
                    style={{ width: 250 }}
                />

                <Button
                    type="primary"
                    onClick={() => openEditModal(null)}
                >
                    {t('Create Product Type')}
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
                    style: { cursor: 'pointer' },
                })}
            />

            <ItemTypeModal
                open={isModalOpen}
                itemType={selectedItemType}
                settings={settings}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => {
                    setIsModalOpen(false);
                    fetchData();
                }}
            />

            {/* Pagination */}
            <SimplePagination
                storageKey={LocalStorageKey.ItemTypePagination}
                current={page}
                total={pagination?.total ?? 0}
                pageSize={limit}
                callFunc={fetchData}
            />
        </div>
    );
}