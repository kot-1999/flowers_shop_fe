'use client'

import { DeleteOutlined } from '@ant-design/icons'
import { Card, Image, InputNumber, Space, Typography, Button } from 'antd'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const { Text } = Typography

interface Props {
    item: any
    t: (key: string) => string
    onUpdate?: (id: string, qty: number, pricingID: string) => void
    onDelete?: (id: string, pricingID: string) => void
    unavailable?: boolean
}

export default function BasketItem({
    item,
    t,
    onUpdate,
    onDelete,
    unavailable = false
}: Props) {
    const pathname = usePathname()

    const good = item.good
    const pricing = item.pricing
    const locale = pathname.split('/')[1]

    const slug
        = good?.name?.[`${locale}Slug`]
        || good?.name?.enSlug

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

    const isEditable = !!onUpdate && !!onDelete

    return (
        <Card
            style={{
                opacity: unavailable ? 0.45 : 1,
                filter: unavailable ? 'grayscale(1)' : 'none',
                border: unavailable ? '1px dashed #d9d9d9' : undefined,
                transition: 'all 0.2s ease'
            }}
        >
            <Space
                style={{
                    width: '100%',
                    justifyContent: 'space-between'
                }}
                align="start"
            >
                {/* LEFT SIDE */}
                <Space align="start">
                    {good?.photos?.[0] && (
                        <Image
                            alt={good.name?.[`${locale}Slug`]}
                            src={good.photos[0]}
                            width={200}
                            height={200}
                            style={{
                                objectFit: 'cover',
                                borderRadius: 8
                            }}
                            preview={false}
                        />
                    )}

                    <div>
                        <Link href={getLink(slug, good.id)}>
                            <Text strong>
                                {good?.name?.[locale]}
                            </Text>
                        </Link>

                        <div>
                            <Text type="secondary">
                                {good?.selectionist?.name?.[locale]} • {good?.selectionist?.country}
                            </Text>
                        </div>

                        <Text>
                            {good?.description?.[locale]}
                        </Text>
                    </div>
                </Space>

                {/* RIGHT SIDE */}
                <Space orientation="vertical" style={{ textAlign: 'right' }}>

                    <Space size={8}>
                        <Text>
                            {pricing?.itemType?.name?.[locale]}
                        </Text>
                        <Text strong>
                            {pricing?.price} €
                        </Text>
                    </Space>

                    <Text type="secondary">
                        {t('Stock')}: {pricing?.quantity}
                    </Text>

                    {/* QUANTITY CONTROL */}
                    <InputNumber
                        min={1}
                        max={pricing?.quantity || 1}
                        value={item.quantity}
                        onChange={(value) =>
                            isEditable
                            && onUpdate?.(
                                item.id,
                                Number(value) || 1,
                                item.pricing.id
                            )
                        }
                        disabled={!isEditable}
                    />

                    {/* DELETE BUTTON */}
                    <Button
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() =>
                            isEditable
                            && onDelete?.(
                                item.id,
                                item.pricing.id
                            )
                        }
                        disabled={!isEditable}
                    >
                        {t('Remove')}
                    </Button>

                    {/* OPTIONAL: subtle edit hint */}
                    {!isEditable && !unavailable && (
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            {t('Click Edit cart to modify')}
                        </Text>
                    )}
                </Space>
            </Space>
        </Card>
    )
}