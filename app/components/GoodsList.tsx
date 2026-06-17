import { ShoppingCartOutlined } from '@ant-design/icons'
import {
    Button,
    Card, Carousel,
    Col,
    Divider,
    Image,
    InputNumber,
    message,
    Radio,
    Row,
    Space,
    Tag,
    Typography
} from 'antd'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const { Text, Paragraph } = Typography

import { GoodState } from '@/app/utils/enums'
import { getTFunc } from '@/app/utils/helpers'

export default function GoodsList({ goodsData, settings }: any) {
    const t = getTFunc()
    const pathname = usePathname()

    const addToBasket = async (pricingId: string, quantity: number) => {
        console.log('Add to basket', {
            pricingId,
            quantity
        })
        message.success('Added to basket ' + quantity + ' ' + pricingId)
    }

    const [quantities, setQuantities] = useState<Record<string, number>>({})

    const [selectedPricing, setSelectedPricing] = useState<Record<string, string>>(() => {
        const defaults: Record<string, string> = {}

        goodsData?.goods?.forEach((good: any) => {
            const availablePricing = good.pricings?.find((p: any) => p.quantity > 0)
            if (availablePricing) {defaults[good.id] = availablePricing.id}
        })

        return defaults
    })

    const [pricingError, setPricingError] = useState<Record<string, boolean>>({})

    const getLink = (slug: string, id: string) => {
        const path = pathname.split('/')

        if (path.length === 2) {
            path.push(t('all-categories'))
        }

        path.push(slug)
        const query = new URLSearchParams()
        query.set('id', id)
        return path.join('/') + `?${query}`
    }

    return (
        <Row gutter={[16, 16]}>
            {goodsData?.goods?.map((good: any) => (
                <Col xs={24} sm={12} md={12} lg={12} xl={8} xxl={8} xxxl={6} key={good.id}>
                    <Card
                        hoverable
                        cover={
                            good.photos?.[0] ? (
                                <Link href={getLink(good.name?.[settings.locale + 'Slug'], good.id)}>
                                    <Carousel arrows draggable>
                                        {good.photos?.map((p: string) => (
                                            <div key={p}>
                                                <Image
                                                    src={p}
                                                    style={{
                                                        width: '100%',
                                                        objectFit: 'cover'
                                                    }}
                                                    preview={false}
                                                />
                                            </div>
                                        ))}
                                    </Carousel>
                                </Link>
                            ) : undefined
                        }
                    >
                        <Space orientation="vertical" size="middle" style={{ width: '100%' }}>
                            <div>
                                <Link href={`${pathname}/${good.name?.[settings.locale + 'Slug']}`}>
                                    <Typography.Title level={5} style={{ marginBottom: 4 }}>
                                        {good.name?.[settings.locale]}
                                    </Typography.Title>
                                </Link>

                                {good.selectionist && (
                                    <Text type="secondary">
                                        {good.selectionist.name?.[settings.locale]} • {good.selectionist.country}
                                    </Text>
                                )}
                            </div>

                            <Paragraph ellipsis={{ rows: 3 }} style={{ marginBottom: 0 }}>
                                {good.description?.[settings.locale]}
                            </Paragraph>

                            {!!good.tags?.length && (
                                <Space wrap size={[4, 4]}>
                                    {good.tags.map((tag: any) => (
                                        <Tag key={tag.id}>{tag.name?.[settings.locale]}</Tag>
                                    ))}
                                </Space>
                            )}

                            {!!good.pricings?.length && (
                                <>
                                    <Divider>{t('Options')}</Divider>

                                    <div
                                        style={{
                                            position: 'relative',
                                            borderRadius: 8,
                                            display: 'block'
                                        }}
                                        className={pricingError[good.id] ? 'pricing-error pulse' : ''}
                                    >

                                        <Radio.Group
                                            value={selectedPricing[good.id]}
                                            onChange={(e) => {
                                                setSelectedPricing((prev) => ({
                                                    ...prev,
                                                    [good.id]: e.target.value
                                                }))
                                                setPricingError((prev) => ({
                                                    ...prev,
                                                    [good.id]: false
                                                }))
                                            }}
                                            disabled={good.state !== GoodState.Available}
                                            style={{
                                                width: '100%',
                                                padding: 6
                                            }}
                                        >
                                            <Space orientation="vertical" style={{ width: '100%' }}>
                                                {good.pricings
                                                    .sort((a: any, b: any) => a.price - b.price)
                                                    .map((pricing: any) => (
                                                        <Radio
                                                            key={pricing.id}
                                                            value={pricing.id}
                                                            disabled={pricing.quantity <= 0}
                                                        >
                                                            <Space>
                                                                <Text strong>{pricing.price} €</Text>
                                                                <Text>
                                                                    {pricing.itemType?.name?.[settings.locale]}
                                                                </Text>
                                                                <Tag>
                                                                    {t('Available')}: {pricing.quantity}
                                                                </Tag>
                                                            </Space>
                                                        </Radio>
                                                    ))}
                                            </Space>
                                        </Radio.Group>
                                    </div>
                                </>
                            )}
                        </Space>

                        {(() => {
                            const currentPricing = good.pricings?.find((p: any) => p.id === selectedPricing[good.id])
                            
                            return (
                                <>
                                    <Divider />

                                    <div
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            gap: 12
                                        }}
                                    >
                                        <Link href={getLink(good.name?.[settings.locale + 'Slug'], good.id)}>
                                            {t('See details')}
                                        </Link>

                                        <Space>
                                            <InputNumber
                                                min={1}
                                                max={currentPricing?.quantity ?? 1}
                                                value={quantities[good.id] ?? 1}
                                                onChange={(value) =>
                                                    setQuantities((prev) => ({
                                                        ...prev,
                                                        [good.id]: Number(value) || 1
                                                    }))
                                                }
                                            />

                                            <Button
                                                type='primary'
                                                size="large"
                                                icon={<ShoppingCartOutlined />}
                                                onClick={() => {
                                                    if (!currentPricing) {
                                                        setPricingError((prev) => ({
                                                            ...prev,
                                                            [good.id]: true
                                                        }))

                                                        setTimeout(() => {
                                                            setPricingError((prev) => ({
                                                                ...prev,
                                                                [good.id]: false
                                                            }))
                                                        }, 3000)

                                                        message.warning(t('Please select an option'))
                                                        return

                                                    }

                                                    setPricingError((prev) => ({
                                                        ...prev,
                                                        [good.id]: false 
                                                    }))

                                                    addToBasket(currentPricing.id, quantities[good.id] ?? 1)
                                                }}
                                            >
                                                {t('Add to Cart')}
                                            </Button>
                                        </Space>
                                    </div>
                                </>
                            )
                        })()}
                    </Card>
                </Col>
            ))}
        </Row>
    )
}