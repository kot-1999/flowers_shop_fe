import {
    Card,
    Divider,
    Flex,
    Typography,
    Tag
} from 'antd'
import { useState } from 'react'

import OrderModal from '@/app/components/order/OrderModal'
import { getOrderStateColor } from '@/app/utils/helpers'

const { Text } = Typography

export default function OrderList({ 
    orders,
    t,
    isAdmin = false
    
}: { 
    orders: any[], 
    t: (val: string) => string
    isAdmin?: boolean,
    
}) {
    const [open, setOpen] = useState<boolean>(false)
    const [orderID, setOrderID] = useState<string>()
    return (
        <Flex vertical gap={16}>
            {orders.map((order) => (
                <Card
                    key={order.id}
                    hoverable
                    onClick={() => {
                        setOrderID(order.id),
                        setOpen(true)
                    }}
                    styles={{
                        body: {
                            padding: 24
                        }
                    }}
                >
                    <Flex
                        vertical
                        gap={20}
                    >
                        {/* Header */}
                        <Flex
                            justify="space-between"
                            align="start"
                        >
                            <Flex vertical gap={4}>

                                <Text
                                    copyable={{
                                        text: order.id
                                    }}
                                    style={{
                                        fontSize: 16
                                    }}
                                >
                                    {order.id}
                                </Text>

                                <Text type="secondary">
                                    {new Date(order.createdAt).toLocaleString()}
                                </Text>
                            </Flex>

                            <Tag
                                color={getOrderStateColor(order.state)}
                                style={{
                                    fontSize: 15,
                                    padding: '5px 14px',
                                    fontWeight: 600
                                }}
                            >
                                {order.state}
                            </Tag>
                        </Flex>

                        <Divider style={{ margin: 0 }} />

                        {/* People */}
                        <Flex gap={48}>
                            <Flex vertical gap={4}>
                                <Text type="secondary">
                                    Recipient
                                </Text>

                                <Text strong>
                                    {order.recipientFirstName}{' '}
                                    {order.recipientLastName}
                                </Text>

                                <Text type="secondary">
                                    {order.recipientEmail}
                                </Text>
                            </Flex>

                            {
                                (order.user.firstName !== order.recipientFirstName
                                    || order.user.lastName !== order.recipientLastName
                                    || order.user.email !== order.recipientEmail)
                                && <Flex vertical gap={4}>
                                    <Text type="secondary">
                                        Customer
                                    </Text>

                                    <Text strong>
                                        {order.user.firstName}{' '}
                                        {order.user.lastName}
                                    </Text>

                                    <Text type="secondary">
                                        {order.user.email}
                                    </Text>
                                </Flex>
                            }
                        </Flex>

                        <Divider style={{ margin: 0 }} />

                        {/* Footer */}
                        <Flex
                            justify="space-between"
                            align="end"
                        >
                            <Flex vertical gap={4}>
                                <Text>
                                    {order.itemsCount} items
                                </Text>

                                <Text type="secondary">
                                    Products:
                                    {' '}
                                    £{Number(order.productsPrice).toFixed(2)}
                                </Text>

                                <Text type="secondary">
                                    Shipping:
                                    {' '}
                                    £{Number(order.shippingPrice).toFixed(2)}
                                </Text>
                            </Flex>

                            <Flex
                                vertical
                                align="end"
                            >
                                <Text type="secondary">
                                    Total
                                </Text>

                                <Text
                                    strong
                                    style={{
                                        fontSize: 28
                                    }}
                                >
                                    £{Number(order.total).toFixed(2)}
                                </Text>
                            </Flex>
                        </Flex>
                    </Flex>
                </Card>
            ))}

            <OrderModal
                open={open}
                isAdmin={isAdmin}
                orderID={orderID}
                t={t}
                onClose={() => setOpen(false)}
            />
        </Flex>
    )
}