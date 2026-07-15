'use client'

import {
    Avatar,
    Button,
    Card,
    Descriptions,
    Divider,
    Flex,
    Modal,
    Image,
    Spin,
    Table,
    Tag,
    Typography
} from 'antd'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

import { fetchOrder, getInvoice, refundOrder, updateOrderState } from '@/app/utils/clientFetchFuntions'
import { Language, OrderState } from '@/app/utils/enums'
import { getOrderStateColor } from '@/app/utils/helpers'

const { Text, Title } = Typography

interface OrderModalProps {
    open: boolean
    orderID?: string
    onClose: () => void
    t: (key: string) => string
    isAdmin?: boolean
    setOrderUpdated: (data: any) => void
}

export default function OrderModal({
    open,
    orderID,
    onClose,
    t,
    isAdmin = false,
    setOrderUpdated
}: OrderModalProps) {
    const [loading, setLoading] = useState(false)
    const [order, setOrder] = useState<any>()
    const isPending = order?.state === OrderState.Pending
    const [invoiceLoading, setInvoiceLoading] = useState(false)
    const pathname = usePathname()
    const currentLocale = pathname.split('/')[1] as Language
    const [refundLoading, setRefundLoading] = useState(false)
    const [stateLoading, setStateLoading] = useState(false)
    const [labelUrl, setLabelUrl] = useState<string | null>(null)
    const canCancel = [
        OrderState.Pending,
        OrderState.Paid,
        OrderState.Processing
    ].includes(order?.state)
        || (
            isAdmin
            && !([
                OrderState.Cancelled,
                OrderState.Refunded,
                OrderState.Expired,
                OrderState.Delivered,
                OrderState.PaymentFailed
            ].includes(order?.state))
        )
    
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

    useEffect(() => {
        setOrderUpdated(order)
    }, [order])

    const getNextStateText = () => {
        switch (order?.state) {
        case OrderState.Paid:
            return t('Start processing')

        case OrderState.Processing:
            return t('Create shipping label')

        case OrderState.Shipped:
            return t('Mark as delivered')

        default:
            return t('Update state')
        }
    }
    
    return (
        <Modal
            open={open}
            onCancel={onClose}
            footer={null}
            width={900}
            destroyOnHidden
            title={t('Order details')}
        >
            {loading || !order  || !orderID ? (
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
                            {t(order.state)}
                        </Tag>
                    </Flex>

                    <Descriptions
                        bordered
                        column={2}
                        size="small"
                    >
                        <Descriptions.Item label={t('Customer')}>
                            {order.user.firstName} {order.user.lastName}
                        </Descriptions.Item>

                        <Descriptions.Item label={t('Email')}>
                            {order.user.email}
                        </Descriptions.Item>

                        {
                            (
                                order.user.firstName !== order.recipientFirstName
                                || order.user.lastName !== order.recipientLastName
                                || order.user.email !== order.recipientEmail
                            ) && (
                                <>
                                    <Descriptions.Item label={t('Recipient name')}>
                                        {order.recipientFirstName} {order.recipientLastName}
                                    </Descriptions.Item>

                                    <Descriptions.Item label={t('Recipient email')}>
                                        {order.recipientEmail}
                                    </Descriptions.Item>
                                </>
                            )
                        }

                        <Descriptions.Item label={t('Address')} span={2}>
                            {
                                order.addressSnapshot
                                    ? `${order.addressSnapshot.apartment ?? ''} ${
                                        order.addressSnapshot.building
                                    } ${order.addressSnapshot.street}, ${
                                        order.addressSnapshot.city
                                    }, ${
                                        order.addressSnapshot.postcode
                                    }, ${
                                        order.addressSnapshot.country
                                    }`
                                    : '-'
                            }
                        </Descriptions.Item>

                        <Descriptions.Item label={t('Tracking Number')}>
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

                    <Flex vertical gap={16}>
                        {/* Price */}
                        <Flex gap={48} wrap="wrap">
                            <Flex vertical gap={4}>
                                <Text type="secondary">
                                    {t('Products')}
                                </Text>

                                <Text strong>
                                    £{Number(order.productsPrice).toFixed(2)}
                                </Text>
                            </Flex>

                            <Flex vertical gap={4}>
                                <Text type="secondary">
                                    {t('Shipping')}
                                </Text>

                                <Text strong>
                                    £{Number(order.shippingPrice).toFixed(2)}
                                </Text>
                            </Flex>

                            <Flex vertical gap={4}>
                                <Text type="secondary">
                                    {t('Total')}
                                </Text>

                                <Text
                                    strong
                                    style={{
                                        fontSize: 20
                                    }}
                                >
                                    £{(
                                        Number(order.productsPrice)
                                    + Number(order.shippingPrice)
                                    ).toFixed(2)}
                                </Text>
                            </Flex>

                            {
                                order.refundAmount && <Flex vertical gap={4}>
                                    <Text type="secondary">
                                        {t('Refunded')}
                                    </Text>

                                    <Text
                                        strong
                                        type="danger"
                                    >
                                        £{order.refundAmount}
                                    </Text>
                                </Flex>
                            }
                        </Flex>
                    </Flex>

                    <Table
                        rowKey="id"
                        pagination={false}
                        dataSource={order.orderItems}
                        columns={[
                            {
                                title: t('Product'),
                                render: (_: any, item: any) => (
                                    <Flex align="center" gap={10}>
                                        <Link
                                            target="_blank"
                                            href={`/${t('all-categories')}/${item.snapshot.name[currentLocale + 'Slug']}?id=${item.snapshot.id}`}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 8
                                            }}
                                        >
                                            <Avatar
                                                shape="square"
                                                size={60}
                                                src={item.snapshot.photos?.[0]}
                                            />

                                            {item.snapshot.name[currentLocale]}
                                        </Link>
                                    </Flex>
                                )
                            },
                            {
                                title: t('Type'),
                                render: (_, item: any) =>
                                    item.snapshot?.itemType?.name[currentLocale]
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
                                    `£${Number(item.unitPrice * item.quantity).toFixed(2)}`
                            }
                        ]}
                    />

                    {
                        labelUrl && isAdmin && (
                            <Card
                                title={t('Shipping label')}
                                extra={
                                    <Button
                                        type="link"
                                        href={labelUrl}
                                        target="_blank"
                                        download
                                    >
                                        {t('Download')}
                                    </Button>
                                }
                            >
                                <Flex justify="center">
                                    <Image
                                        src={labelUrl}
                                        alt={t('Shipping label')}
                                        style={{
                                            maxWidth: '100%',
                                            maxHeight: 600,
                                            objectFit: 'contain'
                                        }}
                                    />
                                </Flex>
                            </Card>
                        )
                    }

                    <Flex justify="space-between" align="center">
                        <Button
                            danger
                            disabled={!canCancel}
                            loading={refundLoading}
                            onClick={async () => {
                                await refundOrder(orderID, setRefundLoading, t)
                                fetchOrder(
                                    setLoading,
                                    orderID,
                                    (data) => setOrder(data.order),
                                    t,
                                    isAdmin
                                )
                            }}
                        >
                            {t('Cancel order')}
                        </Button>

                        <Flex gap={12}>
                            {
                                !isAdmin && isPending 
                                && <Button
                                    type="primary"
                                    onClick={() => console.log('Pay')}
                                >
                                    {t('Pay now')}
                                </Button>
                            }
                            {!isPending
                                && <Button
                                    loading={invoiceLoading}
                                    onClick={() => getInvoice(orderID, setInvoiceLoading, t)}
                                >
                                    {t('Download invoice')}
                                </Button>
                            }

                            {isAdmin && [OrderState.Paid, OrderState.Processing, OrderState.Shipped].includes(order.state)
                                && <Button
                                    type="primary"
                                    loading={stateLoading}
                                    onClick={async () => {
                                        await updateOrderState(
                                            orderID,
                                            setStateLoading,
                                            t,
                                            setLabelUrl
                                        )

                                        await fetchOrder(
                                            setLoading,
                                            orderID,
                                            (data) => setOrder(data.order),
                                            t,
                                            isAdmin
                                        )
                                    }}
                                >
                                    {getNextStateText()}
                                </Button>
                            }
                        </Flex>
                    </Flex>
                    
                </Flex>
            )}
        </Modal>
    )
}