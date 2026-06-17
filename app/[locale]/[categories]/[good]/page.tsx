'use client'

import { ShoppingCartOutlined } from '@ant-design/icons'
import {
    Button,
    Card,
    Carousel,
    Divider,
    Image,
    InputNumber,
    message,
    Radio,
    Space,
    Tag,
    Typography
} from 'antd'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

import { getTFunc } from '@/app/utils/helpers'

const { Title, Text, Paragraph } = Typography

export default function GoodDetailsPage() {
    const t = getTFunc()
    const id = useSearchParams().get('id')

    const [good, setGood] = useState<any>(null)
    const [selectedPricing, setSelectedPricing] = useState<string | null>(null)
    const [quantity, setQuantity] = useState(1)

    useEffect(() => {
        if (!id) {return}

        const load = async () => {
            const res = await fetch(`/api/goods/${id}`)
            const data = await res.json()

            setGood(data.good)

            const first = data.good?.pricings?.find((p: any) => p.quantity > 0)

            if (first) {setSelectedPricing(first.id)}
        }

        load()
    }, [id])

    const addToBasket = async () => {
        if (!selectedPricing) {
            message.warning(t('Select option'))
            return
        }

        const pricing = good.pricings.find((p: any) => p.id === selectedPricing)

        if (!pricing) {return}

        if (quantity > pricing.quantity) {
            message.warning(t('Not enough stock'))
            return
        }

        message.success(t('Added to cart'))
    }

    if (!good) {return null}

    const selected = good.pricings?.find((p: any) => p.id === selectedPricing)

    return (
        <div
            style={{
                maxWidth: 1300,
                margin: '0 auto',
                display: 'flex',
                flexDirection: 'column',
                gap: 20
            }}
        >
            {/* TOP SECTION */}
            <div
                style={{
                    display: 'flex',
                    gap: 24,
                    flexWrap: 'wrap'
                }}
            >
                {/* LEFT - CAROUSEL */}
                <Card style={{
                    flex: 1,
                    minWidth: 320
                }}>
                    <Carousel arrows>
                        {good.photos?.map((p: string) => (
                            <div key={p}>
                                <Image
                                    src={p}
                                    style={{
                                        width: '100%',
                                        maxHeight: '100%',
                                        objectFit: 'cover'
                                    }}
                                    preview={true}
                                />
                            </div>
                        ))}
                    </Carousel>
                </Card>

                {/* RIGHT - BUY BOX */}
                <Card style={{ width: 360 }}>
                    <Title level={4}>{t('Buy')}</Title>

                    {/* PRICINGS */}
                    <Radio.Group
                        value={selectedPricing}
                        onChange={(e) => setSelectedPricing(e.target.value)}
                        style={{ width: '100%' }}
                    >
                        <Space orientation="vertical" style={{ width: '100%' }}>
                            {good.pricings
                                ?.sort((a: any, b: any) => a.price - b.price)
                                .map((p: any) => (
                                    <Radio
                                        key={p.id}
                                        value={p.id}
                                        disabled={p.quantity <= 0}
                                    >
                                        <Space orientation="vertical" size={0}>
                                            <Text strong>{p.price} €</Text>
                                            <Text type="secondary">
                                                {p.itemType?.name?.en}
                                            </Text>
                                            <Text type="secondary">
                                                {t('Available')}: {p.quantity}
                                            </Text>
                                        </Space>
                                    </Radio>
                                ))}
                        </Space>
                    </Radio.Group>

                    <Divider />

                    <Text type="secondary">{t('Quantity')}</Text>

                    <InputNumber
                        min={1}
                        max={selected?.quantity ?? 1}
                        value={quantity}
                        onChange={(v) => setQuantity(Number(v) || 1)}
                        style={{
                            width: '100%',
                            marginTop: 6
                        }}
                    />

                    <Button
                        type="primary"
                        icon={<ShoppingCartOutlined />}
                        size="large"
                        style={{
                            width: '100%',
                            marginTop: 16
                        }}
                        onClick={addToBasket}
                        disabled={!selectedPricing}
                    >
                        {t('Add to cart')}
                    </Button>
                </Card>
            </div>

            {/* DESCRIPTION */}
            <Card>
                <Title level={3}>{good.name?.en}</Title>
                <Paragraph>{good.description?.en}</Paragraph>

                <Space wrap>
                    {good.tags?.map((t: any) => (
                        <Tag key={t.id}>{t.name?.en}</Tag>
                    ))}
                </Space>
            </Card>

            {/* SELECTIONIST (IMPROVED) */}
            {good.selectionist && (
                <Card
                    size="small"
                    style={{ marginBottom: 12 }}
                >
                    <Title level={5} style={{ marginBottom: 8 }}>
                        {t('Selectionist')}
                    </Title>

                    <div style={{ marginBottom: 6 }}>
                        <Text type="secondary">{t('Name')}: </Text>
                        <Text strong>{good.selectionist.name?.en}</Text>
                    </div>

                    <div>
                        <Text type="secondary">{t('Country')}: </Text>
                        <Text>{good.selectionist.country ?? t('Unknown')}</Text>
                    </div>
                </Card>
            )}
        </div>
    )
}