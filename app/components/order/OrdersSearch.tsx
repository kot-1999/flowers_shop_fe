import {
    Row,
    Col, Select,
    Input,
    Button
} from 'antd'

import { OrderState } from '@/app/utils/enums'

export default function OrdersSearch({
    handleSearch,
    options,
    setOptions,
    t
}: {
    handleSearch: () => void
    options: {
        search: string
        states: OrderState[]
        sortBy: string
        sortOrder: string
    }
    setOptions: (options: any) => void,
    t: (val: string) => string
}) {
    const {
        search,
        states,
        sortBy,
        sortOrder
    } = options
    return (
        <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col flex="auto">
                <Input.Search
                    placeholder={t('Search orders')}
                    value={search}
                    onChange={(e) => setOptions({
                        ...options,
                        search: e.target.value
                    })}
                    onSearch={handleSearch}
                    allowClear
                />
            </Col>

            <Col>
                <Select
                    mode="multiple"
                    style={{ width: 220 }}
                    placeholder={t('Status')}
                    value={states}
                    onChange={(states) =>
                        setOptions({
                            ...options,
                            states
                        })
                    }
                    options={Object.values(OrderState).map((state) => ({
                        value: state,
                        label: t(state)
                    }))}
                />
            </Col>

            <Col>
                <Select
                    value={sortBy}
                    onChange={(sortBy) =>
                        setOptions({
                            ...options,
                            sortBy
                        })
                    }
                    style={{ width: 180 }}
                    options={[
                        {
                            value: 'createdAt',
                            label: t('Created')
                        },
                        {
                            value: 'updatedAt',
                            label: t('Updated')
                        },
                        {
                            value: 'productsPrice',
                            label: t('Products price')
                        },
                        {
                            value: 'shippingPrice',
                            label: t('Shipping price')
                        },
                        {
                            value: 'state',
                            label: t('State')
                        }
                    ]}
                />
            </Col>

            <Col>
                <Select
                    value={sortOrder}
                    onChange={(sortOrder) =>
                        setOptions({
                            ...options,
                            sortOrder
                        })
                    }
                    style={{ width: 120 }}
                    options={[
                        {
                            value: 'desc',
                            label: t('DESC')
                        },
                        {
                            value: 'asc',
                            label: t('ASC')
                        }
                    ]}
                />
            </Col>

            <Col>
                <Button
                    type="primary"
                    onClick={handleSearch}
                >
                    {t('Apply')}
                </Button>
            </Col>
        </Row>
    )
}