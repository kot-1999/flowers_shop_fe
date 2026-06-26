'use client'

import {
    Row,
    Col,
    Typography,
    message,
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
import { checkRes, getTFunc } from '@/app/utils/helpers'

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

    const fetchCart = async () => {
        try {
            setLoading(true)

            const res = user
                ? await fetch('/api/basket-items')
                : await fetch('/api/basket-items/public', { method: 'POST' })

            const data = await res.json()

            const ok = await checkRes(res, data, t('Failed to load cart'))
            if (!ok) {return}

            setCartData(data)
        } catch (error: any) {
            message.error(error.message || t('Failed to load cart'))
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (user === undefined) { return }
        fetchCart()
    }, [user])

    // Local edit actions
    const updateItem = (
        basketItemID: string,
        quantity: number,
        pricingID: string,
        goodID: string
    ) => {
        setPendingUpdates((prev) => ({
            ...prev,
            [basketItemID]: {
                basketItemID,
                quantity,
                pricingID,
                goodID
            }
        }))

        setCartData((prev: any) => {
            if (!prev) {return prev}

            const updateList = (list: any[] = []) =>
                list.map((item: any) =>
                    item.id === basketItemID
                        ? {
                            ...item,
                            quantity
                        }
                        : item)

            return {
                ...prev,
                basketItems: updateList(prev.basketItems),
                unavailableBasketItems: updateList(prev.unavailableBasketItems)
            }
        })
    }

    const deleteItem = (
        basketItemID: string,
        pricingID: string,
        goodID: string
    ) => {
        setPendingDeletes((prev) => ({
            ...prev,
            [basketItemID]: {
                id: basketItemID,
                pricingID,
                goodID
            }
        }))

        // optional: remove from UI immediately
        setCartData((prev: any) => {
            if (!prev) {return prev}
            return {
                ...prev,
                basketItems: prev.basketItems?.filter((i: any) => i.id !== basketItemID)
            }
        })
    }

    // Bulk save
    const saveCartChanges = async () => {
        try {
            const endpoint = user
                ? '/api/basket-items'
                : '/api/cookie/basket'

            const updates = Object.values(pendingUpdates).map((toUpdate: any) => ({
                basketItemID: toUpdate.basketItemID,
                quantity: toUpdate.quantity
            }))

            const deletes = Object.values(pendingDeletes)

            if (updates.length) {
                const res = await fetch(endpoint, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ basketItems: updates })
                })

                const data = await res.json()
                await checkRes(res, data, t('Failed to update items'))
            }

            if (deletes.length) {
                const res = await fetch(endpoint, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ basketItems: deletes })
                })

                const data = await res.json()
                await checkRes(res, data, t('Failed to delete items'))
            }

            setPendingUpdates({})
            setPendingDeletes({})
            setEditMode(false)

            await fetchCart()
        } catch (error: any) {
            message.error(error.message || t('Failed to update cart'))
        }
    }

    const cancelEdit = () => {
        setPendingUpdates({})
        setPendingDeletes({})
        setEditMode(false)
        fetchCart()
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
                                <Button type="primary" onClick={saveCartChanges}>
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
                                        € {summary?.totalPrice}
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