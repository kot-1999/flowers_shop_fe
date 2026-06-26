'use client'

import { Row, Col, Typography, message, Spin, Divider, Card, Space, Button } from 'antd'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import BasketItem from '@/app/components/BasketItem'
import { checkRes, getTFunc } from '@/app/utils/helpers'

const { Title, Text } = Typography

export default function Cart() {
    const t = getTFunc()
    const router = useRouter()

    const [loading, setLoading] = useState(false)
    const [cartData, setCartData] = useState<any>(null)
    
    const fetchCart = async () => {
        try {
            setLoading(true)

            const res = await fetch('/api/basket-items')
            const data = await res.json()

            const ok = await checkRes(res, data, t('Failed to load cart'))
            if (!ok) {
                return
            }

            setCartData(data)
        } catch (error: any) {
            message.error(error.message || t('Failed to load cart'))
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchCart()
    }, [])

    const updateItem = async (basketItemID: string, quantity: number) => {
        try {
            const res = await fetch(`/api/basket-items/${basketItemID}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ quantity })
            })

            const data = await res.json()

            const isSuccess = await checkRes(res, data, t('Failed to update item'))
            if (isSuccess) {
                await fetchCart()
            }
        } catch (error: any) {
            message.error(error.message || t('Failed to update item'))
        }
    }

    const deleteItem = async (basketItemID: string) => {
        try {
            const res = await fetch(`/api/basket-items/${basketItemID}`, {
                method: 'DELETE'
            })

            const data = await res.json()

            const isSuccess = await checkRes(res, data, t('Failed to remove item'))
            if (isSuccess) {
                await fetchCart()
            }
        } catch (error: any) {
            message.error(error.message || t('Failed to remove item'))
        }
    }

    const goCheckout = () => {
        router.push(`/${t('locale')}/checkout`)
    }

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                padding: 40 
            }}>
                <Spin size="large" />
            </div>
        )
    }

    const summary = cartData?.summary

    const hasItems
        = cartData?.basketItems?.length
        || cartData?.unavailableBasketItems?.length

    return (
        <div style={{
            padding: 24,
            maxWidth: 1200,
            margin: '0 auto' 
        }}>
            <Title level={2}>{t('Shopping Cart')}</Title>

            {/* SUMMARY (more commercial) */}
            {summary && (
                <Card
                    style={{
                        marginBottom: 20,
                        borderRadius: 12
                    }}
                >
                    <Space size="large" wrap>
                        <Text strong style={{ fontSize: 16 }}>
                            {t('Total')}: {summary.totalPrice} €
                        </Text>

                        <Text>
                            {t('Available items')}: {summary.totalAvailable}
                        </Text>

                        <Text type="secondary">
                            {t('Unavailable')}: {summary.totalUnavailable}
                        </Text>
                    </Space>
                </Card>
            )}

            {/* AVAILABLE ITEMS */}
            {!!cartData?.basketItems?.length && (
                <>
                    <Title level={4}>{t('Available items')}</Title>

                    <Row gutter={[16, 16]}>
                        {cartData.basketItems.map((item: any) => (
                            <Col xs={24} key={item.id}>
                                <BasketItem
                                    item={item}
                                    t={t}
                                    onUpdate={updateItem}
                                    onDelete={deleteItem}
                                />
                            </Col>
                        ))}
                    </Row>
                </>
            )}

            {/* UNAVAILABLE ITEMS */}
            {!!cartData?.unavailableBasketItems?.length && (
                <>
                    <Divider />

                    <Title level={4} style={{ color: '#999' }}>
                        {t('Unavailable items')}
                    </Title>

                    {/* UX EXPLANATION */}
                    <Card
                        style={{
                            marginBottom: 16,
                            background: '#fafafa',
                            border: '1px dashed #d9d9d9'
                        }}
                    >
                        <Text type="secondary">
                            These items are currently unavailable. You can keep them in your cart —
                            they will become purchasable again as soon as they are back in stock.
                        </Text>
                    </Card>

                    <Row gutter={[16, 16]}>
                        {cartData.unavailableBasketItems.map((item: any) => (
                            <Col xs={24} key={item.id}>
                                <BasketItem
                                    item={item}
                                    t={t}
                                    onUpdate={updateItem}
                                    onDelete={deleteItem}
                                    unavailable
                                />
                            </Col>
                        ))}
                    </Row>
                </>
            )}

            {/* EMPTY STATE */}
            {!hasItems && !loading && (
                <div style={{
                    textAlign: 'center',
                    padding: 60 
                }}>
                    <Text type="secondary">{t('Your cart is empty')}</Text>
                </div>
            )}

            {/* CHECKOUT CTA (commercial bottom action) */}
            {!!cartData?.basketItems?.length && (
                <Card
                    style={{
                        marginTop: 30,
                        position: 'sticky',
                        bottom: 16,
                        borderRadius: 14,
                        boxShadow: '0 8px 24px rgba(0,0,0,0.08)'
                    }}
                >
                    <Row justify="space-between" align="middle">
                        {/* LEFT SIDE */}
                        <Col>
                            <Space direction="vertical" size={0}>
                                <Text strong style={{ fontSize: 16 }}>
                                    {t('Ready to checkout')}
                                </Text>

                                <Text type="secondary">
                                    {summary?.totalAvailable} {t('items available for purchase')}
                                </Text>
                            </Space>
                        </Col>

                        {/* RIGHT SIDE */}
                        <Col>
                            <Space size={24} align="center">
                                <Space orientation="vertical" size={0} style={{ textAlign: 'right' }}>
                                    <Text type="secondary">
                                        {t('Total')}
                                    </Text>

                                    <Text strong style={{ fontSize: 22 }}>
                                        € {summary?.totalPrice}
                                    </Text>
                                </Space>

                                <Button
                                    type="primary"
                                    size="large"
                                    onClick={goCheckout}
                                >
                                    {t('Proceed to Checkout')}
                                </Button>
                            </Space>
                        </Col>
                    </Row>
                </Card>
            )}
        </div>
    )
}