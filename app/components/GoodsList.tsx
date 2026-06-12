import {Card, Col, Image, Row, Space, Tag} from 'antd'

export default function GoodsList({ goodsData, settings }: any) {


    return (
        <Row gutter={[16, 16]}>
            {goodsData?.goods?.map((good: any) => (
                <Col xs={24} sm={12} md={8} key={good.id}>
                    <Card
                        title={
                            good.name[settings.locale]
                        }
                        extra={<Tag>{good.state}</Tag>}
                    >
                        {/* IMAGE */}
                        {good.photos?.[0] && (
                            <Image
                                src={good.photos[0]}
                                alt={good.name?.en ?? 'good'}
                            />
                        )}

                        {/* DESCRIPTION */}
                        <p>
                            {good.description[settings.locale]}
                        </p>

                        {/* PRICE */}
                        {good.pricings?.length > 0 && (
                            <div style={{ overflowX: 'auto' }}>
                                <Space orientation="vertical" size={[6, 6]} wrap>
                                    {good.pricings.map((p: any) => (
                                        <div key={p.id}>
                                            <b>{p.price} €</b>
                                            {' — '}
                                            <span>{p.itemType?.name[settings.locale]}</span>
                                        </div>
                                    ))}
                                </Space>
                            </div>
                        )}

                        {/* TAGS */}
                        <Space wrap>
                            {good.tags?.map((tag: any) => (
                                <Tag key={tag.id}>
                                    {tag.name[settings?.locale]}
                                </Tag>
                            ))}
                        </Space>

                        {/* SELECTIONIST */}
                        {good.selectionist && (
                            <div>
                                {good.selectionist.name[settings?.locale]}
                                {' '}
                                <Tag>{good.selectionist.country}</Tag>
                            </div>
                        )}
                    </Card>
                </Col>
            ))}
        </Row>
    )
}