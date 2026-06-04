'use client'

import {
    Card,
    Col,
    Progress,
    Row,
    Statistic,
    Table,
    Tag,
    Typography,
    Button,
    Input, Flex, Layout,
} from 'antd'

import {
    WarningOutlined,
    RocketOutlined,
    GlobalOutlined,
    RadarChartOutlined,
    SearchOutlined,
} from '@ant-design/icons'

const { Title, Text } = Typography

const towerColumns = [
    {
        title: 'ID',
        dataIndex: 'id',
    },
    {
        title: 'Location',
        dataIndex: 'location',
    },
    {
        title: 'Load',
        dataIndex: 'load',
        render: (value: number) => (
            <Progress
                percent={value}
                size="small"
                strokeColor="#5eead4"
                railColor="rgba(255,255,255,0.06)"
                showInfo={false}
            />
        ),
    },
    {
        title: 'Devices',
        dataIndex: 'devices',
    },
]

const towerData = [
    {
        key: 1,
        id: 'TWR-001',
        location: 'Portland, OR',
        load: 95,
        devices: '1,258',
    },
    {
        key: 2,
        id: 'RD-35',
        location: 'Seattle, WA',
        load: 81,
        devices: '1,738',
    },
    {
        key: 3,
        id: 'HFK-456',
        location: 'San Francisco, CA',
        load: 78,
        devices: '1,884',
    },
]
export default function App() {
    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Flex vertical gap={24}>

                {/* HEADER */}
                <Flex justify="space-between" align="center">
                    <Flex vertical>
                        <Title level={2}>
                            CyberDefend Overview
                        </Title>

                        <Text type="secondary">
                            Satellite monitoring & collision detection
                        </Text>
                    </Flex>

                    <Input
                        className="inactive-surface"
                        prefix={<SearchOutlined />}
                        placeholder="Search..."
                        style={{ width: 260 }}
                    />
                </Flex>

                {/* TOP GRID */}
                <Row gutter={[24, 24]}>

                    {/* SAT CARD */}
                    <Col xs={24} lg={8}>
                        <Card className="glass-card">
                            <Flex vertical gap={20}>

                                <Flex gap={16}>
                                    <RocketOutlined />

                                    <Flex vertical>
                                        <Text type="secondary">
                                            ACTIVE SATELLITE
                                        </Text>

                                        <Title level={4}>
                                            STARLINK-17524
                                        </Title>
                                    </Flex>
                                </Flex>

                                <Progress
                                    percent={72}
                                />

                                <div className="card-section" style={{ padding: 12 }}>
                                    <Row gutter={16}>
                                        <Col span={12}>
                                            <Statistic
                                                title="Signal"
                                                value="Weak"
                                            />
                                        </Col>

                                        <Col span={12}>
                                            <Statistic
                                                title="Frequency"
                                                value="43.5 MHz"
                                            />
                                        </Col>
                                    </Row>
                                </div>

                            </Flex>
                        </Card>
                    </Col>

                    {/* GLOBAL NETWORK */}
                    <Col xs={24} lg={10}>
                        <Card className="glass-card" style={{ height: '100%' }}>
                            <Flex vertical gap={24}>

                                <Flex gap={16}>
                                    <GlobalOutlined />

                                    <Flex vertical>
                                        <Title level={4}>
                                            Global Network
                                        </Title>

                                        <Text type="secondary">
                                            Live orbital monitoring
                                        </Text>
                                    </Flex>
                                </Flex>

                                <Row gutter={16}>
                                    <Col span={8}>
                                        <div className="card-section" style={{ padding: 12 }}>
                                            <Statistic title="Satellites" value={2584} />
                                        </div>
                                    </Col>

                                    <Col span={8}>
                                        <div className="card-section" style={{ padding: 12 }}>
                                            <Statistic title="Collisions" value={12} />
                                        </div>
                                    </Col>

                                    <Col span={8}>
                                        <div className="card-section active-surface" style={{ padding: 12 }}>
                                            <Statistic title="Coverage" value="94%" />
                                        </div>
                                    </Col>
                                </Row>

                            </Flex>
                        </Card>
                    </Col>

                    {/* ALERT */}
                    <Col xs={24} lg={6}>
                        <Card className="glass-card">
                            <Flex vertical gap={20}>

                                <Flex gap={12}>
                                    <WarningOutlined />

                                    <Title level={4}>
                                        Collision Risk
                                    </Title>
                                </Flex>

                                <div className="card-section" style={{ padding: 12 }}>
                                    <Text type="secondary">Chance of collision</Text>
                                    <Title level={1}>89%</Title>
                                </div>

                                <Tag color="error">
                                    Critical Alert
                                </Tag>

                                <div className="inactive-surface" style={{ padding: 10 }}>
                                    <Text type="secondary">
                                        Estimated collision window:
                                        15:31:11 UTC
                                    </Text>
                                </div>

                                <Button type="primary" block>
                                    Resolve Issue
                                </Button>

                            </Flex>
                        </Card>
                    </Col>

                </Row>

                {/* BOTTOM */}
                <Row gutter={[24, 24]}>

                    {/* METRICS */}
                    <Col xs={24} lg={8}>
                        <Card className="glass-card">
                            <Flex vertical gap={24}>

                                <Flex gap={12}>
                                    <RadarChartOutlined />
                                    <Title level={4}>Velocity Metrics</Title>
                                </Flex>

                                <div className="card-section" style={{ padding: 12 }}>
                                    <Statistic title="Current Speed" value="24.9 km/h" />
                                </div>

                                <div className="card-section" style={{ padding: 12 }}>
                                    <Statistic title="Target Speed" value="27 km/h" />
                                </div>

                                <Row gutter={16}>
                                    <Col span={12}>
                                        <div className="inactive-surface" style={{ padding: 12 }}>
                                            <Statistic title="Targets" value={6} />
                                        </div>
                                    </Col>

                                    <Col span={12}>
                                        <div className="active-surface" style={{ padding: 12 }}>
                                            <Statistic title="Alerts" value={2} />
                                        </div>
                                    </Col>
                                </Row>

                            </Flex>
                        </Card>
                    </Col>

                    {/* TABLE */}
                    <Col xs={24} lg={16}>
                        <Card className="glass-card">
                            <Flex vertical gap={20}>

                                <Flex justify="space-between" align="center">
                                    <Flex vertical>
                                        <Title level={4}>Active Towers</Title>
                                        <Text type="secondary">
                                            24 active issues detected
                                        </Text>
                                    </Flex>

                                    <Button>
                                        View All
                                    </Button>
                                </Flex>

                                <Table
                                    className="inactive-surface"
                                    columns={towerColumns}
                                    dataSource={towerData}
                                    pagination={false}
                                />

                            </Flex>
                        </Card>
                    </Col>

                </Row>

            </Flex>
        </Layout>
    )
}