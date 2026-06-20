'use client'

import { Button, Card, Space, Tag, Typography, Popconfirm } from 'antd'

import { getTFunc } from '@/app/utils/helpers'

export default function AddressCard({
    address,
    onEdit,
    onDelete,
    onSetDefault,
    loadingDefault
}: any) {
    const t = getTFunc()

    return (
        <Card>
            <Space orientation="vertical" style={{ width: '100%' }} size={8}>
                {/* HEADER */}
                <Space>
                    <Typography.Text strong>
                        {address.street} {address.building}
                    </Typography.Text>

                    {address.isDefault && (
                        <Tag color="green">{t('Default')}</Tag>
                    )}
                </Space>

                {/* DETAILS */}
                <Typography.Text>
                    {address.city}, {address.postcode}
                </Typography.Text>

                <Typography.Text type="secondary">
                    {address.country}
                </Typography.Text>

                {/* ACTIONS */}
                <Space>
                    <Button onClick={() => onEdit(address)}>
                        {t('Edit')}
                    </Button>

                    {!address.isDefault && (
                        <Button
                            type="default"
                            loading={loadingDefault}
                            onClick={() => onSetDefault?.(address.id)}
                        >
                            {t('Make default')}
                        </Button>
                    )}

                    <Popconfirm
                        title={t('Delete address?')}
                        okText={t('Yes')}
                        cancelText={t('No')}
                        onConfirm={() => onDelete(address.id)}
                    >
                        <Button danger>
                            {t('Delete')}
                        </Button>
                    </Popconfirm>
                </Space>
            </Space>
        </Card>
    )
}