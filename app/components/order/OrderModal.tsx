'use client'

import {
    Descriptions,
    Divider,
    Flex,
    Modal,
    Spin,
    Table,
    Tag,
    Typography
} from 'antd'
import { useEffect, useState } from 'react'

import { fetchOrder } from '@/app/utils/clientFetchFuntions'
import { getOrderStateColor } from '@/app/utils/helpers'

const { Text, Title } = Typography

interface OrderModalProps {
    open: boolean
    orderID?: string
    onClose: () => void
    t: (key: string) => string
    isAdmin?: boolean
}

export default function OrderModal({
    open,
    orderID,
    onClose,
    t,
    isAdmin = false
}: OrderModalProps) {
    const [loading, setLoading] = useState(false)
    const [order, setOrder] = useState<any>()

    useEffect(() => {
        if (!open || !orderID) {
            return
        }

        fetchOrder(
            setLoading,
            orderID,
            (data) => setOrder(data.order),
            t,
            isAdmin
        )
    }, [open, orderID])

    return (
        <Modal
            open={open}
            onCancel={onClose}
            footer={null}
            width={900}
            destroyOnHidden
            title={t('Order details')}
        >
            {loading || !order ? (
                <Flex
                    justify="center"
                    style={{ padding: 80 }}
                >
                    <Spin size="large" />
                </Flex>
            ) : (
                <Flex vertical gap={24}>
                    <Flex justify="space-between" align="center">
                        <div>
                            <Title
                                level={4}
                                style={{ marginBottom: 0 }}
                            >
                                {order.id}
                            </Title>

                            <Text type="secondary">
                                {new Date(order.createdAt).toLocaleString()}
                            </Text>
                        </div>

                        <Tag
                            color={getOrderStateColor(order.state)}
                            style={{
                                fontSize: 15,
                                padding: '6px 18px',
                                borderRadius: 999,
                                fontWeight: 600
                            }}
                        >
                            {order.state}
                        </Tag>
                    </Flex>

                    <Descriptions
                        bordered
                        column={2}
                        size="small"
                    >
                        <Descriptions.Item label={t('Recipient')}>
                            {order.recipientFirstName} {order.recipientLastName}
                        </Descriptions.Item>

                        <Descriptions.Item label={t('Email')}>
                            {order.recipientEmail}
                        </Descriptions.Item>

                        <Descriptions.Item label={t('Products')}>
                            £{Number(order.productsPrice).toFixed(2)}
                        </Descriptions.Item>

                        <Descriptions.Item label={t('Shipping')}>
                            £{Number(order.shippingPrice).toFixed(2)}
                        </Descriptions.Item>

                        <Descriptions.Item label={t('Total')}>
                            <Text strong>
                                £{(
                                    Number(order.productsPrice)
                                + Number(order.shippingPrice)
                                ).toFixed(2)}
                            </Text>
                        </Descriptions.Item>

                        <Descriptions.Item label={t('Refund')}>
                            {order.refundAmount
                                ? `£${Number(order.refundAmount).toFixed(2)}`
                                : '-'}
                        </Descriptions.Item>

                        <Descriptions.Item label={t('Payment')}>
                            {order.paymentTransactionID ?? '-'}
                        </Descriptions.Item>

                        <Descriptions.Item label={t('Shipping transaction')}>
                            {order.shippingTransactionID ?? '-'}
                        </Descriptions.Item>

                        <Descriptions.Item label={t('Tracking')}>
                            {order.trackingNumber ?? '-'}
                        </Descriptions.Item>

                        <Descriptions.Item label={t('Tracking URL')}>
                            {order.trackingUrl ? (
                                <a
                                    href={order.trackingUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    {order.trackingUrl}
                                </a>
                            ) : (
                                '-'
                            )}
                        </Descriptions.Item>
                    </Descriptions>

                    <Divider />

                    <Title level={5}>
                        {t('Items')}
                    </Title>

                    <Table
                        rowKey="id"
                        pagination={false}
                        dataSource={order.orderItems}
                        columns={[
                            {
                                title: t('Product'),
                                render: (_, item: any) =>
                                    item.good?.name
                            },
                            {
                                title: t('Type'),
                                render: (_, item: any) =>
                                    item.itemType?.name
                            },
                            {
                                title: t('Qty'),
                                dataIndex: 'quantity'
                            },
                            {
                                title: t('Unit'),
                                render: (_, item: any) =>
                                    `£${Number(item.unitPrice).toFixed(2)}`
                            },
                            {
                                title: t('Total'),
                                render: (_, item: any) =>
                                    `£${Number(item.totalPrice).toFixed(2)}`
                            }
                        ]}
                    />
                </Flex>
            )}
        </Modal>
    )
}