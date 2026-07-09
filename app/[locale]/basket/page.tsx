'use client'

import {
    Row,
    Col,
    Typography,
    Spin,
    Divider,
    Card,
    Space,
    Button
} from 'antd'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { useAuth } from '@/app/components/AuthContent'
import BasketItem from '@/app/components/BasketItem'
import { fetchCart, saveCartChanges } from '@/app/utils/clientFetchFuntions'
import { deleteItem, getTFunc, updateItem } from '@/app/utils/helpers'

const { Title, Text } = Typography

export default function Cart() {
    const t = getTFunc()
    const router = useRouter()
    const { user } = useAuth()

    const [loading, setLoading] = useState(false)
    const [cartData, setCartData] = useState<any>(null)

    // EDIT MODE
    const [editMode, setEditMode] = useState(false)

    // pending changes
    const [pendingUpdates, setPendingUpdates] = useState<Record<string, any>>({})
    const [pendingDeletes, setPendingDeletes] = useState<Record<string, any>>({})

    useEffect(() => {
        if (user === undefined) { return }
        fetchCart(user, setCartData, setLoading, t)
    }, [user])

    const cancelEdit = () => {
        setPendingUpdates({})
        setPendingDeletes({})
        setEditMode(false)
        fetchCart(user, setCartData, setLoading, t)
    }

    const goCheckout = () => {
        router.push('/basket/checkout')
    }

    if (loading || !cartData) {
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
            <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
                <Col>
                    <Title level={2} style={{ margin: 0 }}>
                        {t('Shopping Cart')}
                    </Title>
                </Col>

                <Col>
                    <Space>
                        {!editMode ? (
                            <Button onClick={() => setEditMode(true)}>
                                {t('Edit cart')}
                            </Button>
                        ) : (
                            <>
                                <Button type="primary" onClick={() => saveCartChanges(
                                    user,
                                    pendingUpdates,
                                    pendingDeletes,
                                    setPendingUpdates,
                                    setPendingDeletes,
                                    setEditMode,
                                    setCartData,
                                    setLoading,
                                    t
                                )}>
                                    {t('Save changes')}
                                </Button>
                                <Button onClick={cancelEdit}>
                                    {t('Cancel')}
                                </Button>
                            </>
                        )}
                    </Space>
                </Col>
            </Row>

            {summary && (
                <Card style={{
                    marginBottom: 20,
                    borderRadius: 12 
                }}>
                    <Space size="large" wrap>
                        <Text strong style={{ fontSize: 16 }}>
                            {t('Total')}: {summary.totalPrice} £
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

            {!!cartData?.basketItems?.length && (
                <>
                    <Title level={4}>{t('Available items')}</Title>

                    <Row gutter={[16, 16]}>
                        {cartData.basketItems.map((item: any) => (
                            <Col xs={24} key={item.id}>
                                <BasketItem
                                    item={item}
                                    t={t}
                                    onUpdate={editMode ? updateItem : undefined}
                                    onDelete={editMode ? deleteItem : undefined}
                                    setCartData={setCartData}
                                    setPendingUpdates={setPendingUpdates}
                                    setPendingDeletes={setPendingDeletes}
                                />
                            </Col>
                        ))}
                    </Row>
                </>
            )}

            {!!cartData?.unavailableBasketItems?.length && (
                <>
                    <Divider />

                    <Title level={4} style={{ color: '#999' }}>
                        {t('Unavailable items')}
                    </Title>

                    <Row gutter={[16, 16]}>
                        {cartData.unavailableBasketItems.map((item: any) => (
                            <Col xs={24} key={item.id}>
                                <BasketItem
                                    item={item}
                                    t={t}
                                    onUpdate={editMode ? updateItem : undefined}
                                    onDelete={editMode ? deleteItem : undefined}
                                    unavailable
                                    setCartData={setCartData}
                                    setPendingUpdates={setPendingUpdates}
                                    setPendingDeletes={setPendingDeletes}
                                />
                            </Col>
                        ))}
                    </Row>
                </>
            )}

            {!hasItems && !loading && (
                <div style={{
                    textAlign: 'center',
                    padding: 60 
                }}>
                    <Text type="secondary">{t('Your cart is empty')}</Text>
                </div>
            )}

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
                        <Col>
                            <Space orientation="vertical" size={0}>
                                <Text strong style={{ fontSize: 16 }}>
                                    {t('Ready to checkout')}
                                </Text>
                                <Text type="secondary">
                                    {summary?.totalAvailable} {t('items available for purchase')}
                                </Text>
                            </Space>
                        </Col>

                        <Col>
                            <Space size={24} align="center">
                                <Space orientation="vertical" size={0} style={{ textAlign: 'right' }}>
                                    <Text type="secondary">{t('Total')}</Text>
                                    <Text strong style={{ fontSize: 22 }}>
                                        £ {summary?.totalPrice}
                                    </Text>
                                </Space>

                                <Button type="primary" size="large" onClick={goCheckout}>
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