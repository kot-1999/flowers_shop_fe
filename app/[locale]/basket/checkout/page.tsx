'use client'

import {
    Button,
    Card,
    Col,
    Divider,
    Form, Image,
    Input, message,
    Radio,
    Row,
    Select,
    Space, Spin,
    Steps,
    Typography
} from 'antd'
import { useEffect, useRef, useState } from 'react'

import { useAuth } from '@/app/components/AuthContent'
import AddressModal from '@/app/components/profile/AddressModal'
import {
    fetchAddresses,
    fetchUser
} from '@/app/utils/clientFetchFuntions'
import { LocalStorageKey } from '@/app/utils/enums'
import {
    checkRes, getLocalStorage,
    getTFunc,
    setLocalStorage
} from '@/app/utils/helpers'

const { Title, Paragraph } = Typography

enum CheckoutStep {
    Customer = 0,
    Address,
    Shipping,
    Order,
    Payment
}

export default function Checkout() {
    const [currentStep, setCurrentStep] = useState(CheckoutStep.Customer)
    const { user: authUser } = useAuth()
    const t = getTFunc()
    const [loading, setLoading] = useState(false)

    const [user, setUser] = useState<any>(null)
    const [form] = Form.useForm()

    const [addresses, setAddresses] = useState<any[]>([])
    const [address, setAddress] = useState<any>(null)
    const addressRef = useRef<any>(null)

    const [shipping, setShipping] = useState<any>(null)
    const [selectedRate, setSelectedRate] = useState<any>(null)

    const [customer, setCustomer] = useState({
        firstName: '',
        lastName: '',
        email: ''
    })

    const [addressKey, setAddressKey] = useState<string | null>(null)

    useEffect(() => {
        if (!authUser) {return}

        fetchUser(authUser, setLoading, setUser)
        fetchAddresses(setAddresses, setLoading, t)
    }, [authUser])

    useEffect(() => {
        if (!user) {return}

        setCustomer({
            firstName: user?.firstName ?? '',
            lastName: user?.lastName ?? '',
            email: user?.email ?? ''
        })
    }, [user])

    useEffect(() => {
        if (!addresses?.length) {return}

        const def = addresses.find((a: any) => a.isDefault)

        if (def) {
            setAddress(def)
        } else {
            setAddress(addresses[0])
        }
    }, [addresses])

    useEffect(() => {
        if (currentStep !== CheckoutStep.Shipping && !address?.id) {
            return
        }
        setLoading(true)

        const checkoutToken = getLocalStorage(LocalStorageKey.CheckoutToken)
        const headers: any = {
            'Content-Type': 'application/json'
        }
        if (checkoutToken) {
            headers['Authorization'] = `Bearer ${checkoutToken}`
        }

        const loadRates = async () => {
            try {
                const res = await fetch('/api/shipping', {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({
                        addressID: address.id
                    })
                })
                const data = await res.json()

                setShipping(data)

                if (data.rates?.length) {
                    setSelectedRate(data.rates[0]) // default selection
                }
            } catch {
                message.error(t('Failed to load rates'))
            } finally {
                setLoading(false)
            }
        }

        loadRates()
    }, [addressKey])

    const handleNext = async () => {
        if (currentStep === CheckoutStep.Customer) {
            await form.validateFields()

            const values = form.getFieldsValue()
            setCustomer(values)

            await continueCustomer()
            return
        }

        if (currentStep === CheckoutStep.Address) {
            await addressRef.current?.submit()
            setAddressKey(JSON.stringify({
                country: address?.country,
                city: address?.city,
                street: address?.street,
                building: address?.building,
                apartment: address?.apartment,
                postcode: address?.postcode
            }))
            setCurrentStep(CheckoutStep.Shipping)
            return
        }

        if (currentStep === CheckoutStep.Shipping) {
            if (!selectedRate) {
                message.error(t('Please select a shipping method'))
                return
            }

            setCurrentStep(CheckoutStep.Order)
            return
        }
    }

    const previous = () => {
        if (currentStep > CheckoutStep.Customer) {
            setCurrentStep((prev) => prev - 1)
        }
    }

    const continueCustomer = async () => {
        if (authUser) {
            setCurrentStep(CheckoutStep.Address)
            return
        }

        setLoading(true)

        try {
            const res = await fetch('/api/checkout/user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    user: customer
                })
            })

            const data = await res.json()

            await checkRes(
                res,
                data,
                t('Unable to continue checkout')
            )

            setLocalStorage(
                LocalStorageKey.CheckoutToken,
                data.user.token
            )
            setCurrentStep(CheckoutStep.Address)
        } finally {
            setLoading(false)
        }
    }

    const renderStep = () => {
        switch (currentStep) {
        case CheckoutStep.Customer:
            return (
                <Form layout="vertical" form={form}>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label="First name" name="firstName" required>
                                <Input
                                    value={customer.firstName}
                                    onChange={(e) =>
                                        setCustomer({
                                            ...customer,
                                            firstName: e.target.value
                                        })
                                    }
                                    required
                                />
                            </Form.Item>
                        </Col>

                        <Col span={12}>
                            <Form.Item label="Last name" name="lastName" required>
                                <Input
                                    value={customer.lastName}
                                    onChange={(e) =>
                                        setCustomer({
                                            ...customer,
                                            lastName: e.target.value
                                        })
                                    }
                                    required
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item label="Email" name="email" required>
                        <Input
                            value={customer.email}
                            onChange={(e) =>
                                setCustomer({
                                    ...customer,
                                    email: e.target.value
                                })
                            }
                            required
                        />
                    </Form.Item>
                </Form>
            )

        case CheckoutStep.Address:
            return (
                <Space
                    orientation="vertical"
                    size="large"
                    style={{ width: '100%' }}
                >
                    <Title level={4}>{t('Address')}</Title>

                    {!authUser && (
                        <>
                            <Paragraph>
                                {t('Please enter your delivery address')}
                            </Paragraph>

                            <AddressModal
                                address={address}
                                useForm={true}
                                ref={addressRef}
                                onSuccess={(addr: any) => { setAddress(addr)}}
                            />
                        </>
                    )}

                    {authUser && (
                        <>
                            <Paragraph>
                                {t('Select or edit your address')}
                            </Paragraph>

                            <Select
                                style={{ width: '100%' }}
                                value={address?.id}
                                onChange={(id) => {
                                    const addr
                                            = addresses.find((a) => a.id === id)

                                    setAddress(addr)
                                }}
                                options={addresses.map((a) => ({
                                    value: a.id,
                                    label: `${a.street}, ${a.city}, ${a.country}`
                                }))}
                            />

                            <Button
                                style={{ marginTop: 12 }}
                                onClick={() => {
                                    setAddress(null)
                                }}
                            >
                                {t('Create new address')}
                            </Button>

                            <AddressModal
                                ref={addressRef}
                                address={address}
                                useForm={true}
                                onSuccess={(addr: any) => { setAddress(addr)}}
                            />
                        </>
                    )}
                </Space>
            )

        case CheckoutStep.Shipping:
            return (
                <Space
                    orientation="vertical"
                    size="large"
                    style={{ width: '100%' }}
                >
                    <Title level={4}>{t('Shipping')}</Title>

                    <Paragraph>
                        {t('Select a shipping method')}
                    </Paragraph>

                    <Radio.Group
                        style={{ width: '100%' }}
                        value={selectedRate?.objectId}
                        onChange={(e) => {
                            const rate = shipping.rates.find((r: any) => r.objectId === e.target.value)

                            setSelectedRate(rate)
                        }}
                    >
                        <Space
                            orientation="vertical"
                            style={{ width: '100%' }}
                        >
                            {shipping?.rates?.sort((a: any, b: any) => Number(a.amountLocal) - Number(b.amountLocal))?.map((rate: any) => (
                                <Card
                                    key={rate.objectId}
                                    hoverable
                                >
                                    <Radio
                                        value={rate.objectId}
                                        style={{ width: '100%' }}
                                    >
                                        <Row
                                            align="middle"
                                            justify="space-between"
                                            gutter={24}
                                        >
                                            <Col flex="140px">
                                                <Card
                                                    size="small"
                                                    styles={{
                                                        body: {
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center'
                                                        }
                                                    }}
                                                >
                                                    <Image
                                                        preview={false}
                                                        src={rate.providerImage200}
                                                        alt={rate.provider}
                                                        style={{
                                                            maxWidth: '100%',
                                                            objectFit: 'contain',
                                                            display: 'block'
                                                        }}
                                                    />
                                                </Card>
                                            </Col>

                                            <Col flex="auto">
                                                <Space
                                                    orientation="vertical"
                                                    size={0}
                                                >
                                                    <Typography.Text strong>
                                                        {rate.provider}
                                                    </Typography.Text>

                                                    <Typography.Text>
                                                        {rate.servicelevel.name}
                                                    </Typography.Text>

                                                    {rate.durationTerms && (
                                                        <Typography.Text type="secondary">
                                                            {rate.durationTerms}
                                                        </Typography.Text>
                                                    )}

                                                    {rate.zone && (
                                                        <Typography.Text type="secondary">
                                                            {t('Destination')}: {shipping?.addressTo?.city} {shipping?.addressTo?.country}
                                                        </Typography.Text>
                                                    )}
                                                </Space>
                                            </Col>

                                            <Col>
                                                <Typography.Title
                                                    level={5}
                                                    style={{ margin: 0 }}
                                                >
                                                    {rate.amountLocal} {rate.currencyLocal}
                                                </Typography.Title>
                                            </Col>
                                        </Row>
                                    </Radio>
                                </Card>
                            ))}
                        </Space>
                    </Radio.Group>
                </Space>
            )

        case CheckoutStep.Order:
            return (
                <Space orientation="vertical" size="large" style={{ width: '100%' }}>
                    <Title level={4}>{t('Order review')}</Title>

                    <Card>
                        <Space orientation="vertical" style={{ width: '100%' }} size="middle">

                            {/* ADDRESS */}
                            <div>
                                <Typography.Text type="secondary">
                                    {t('Shipping address')}
                                </Typography.Text>

                                <div style={{ marginTop: 6 }}>
                                    <Typography.Text strong>
                                        {customer.firstName + ' ' + customer.lastName}
                                    </Typography.Text>
                                    <br />
                                    <Typography.Text>
                                        {[
                                            address?.apartment,
                                            address?.building,
                                            address?.street
                                        ]
                                            .filter(Boolean)
                                            .join(' ')}
                                        {address?.city ? `, ${address.city}` : ''}
                                    </Typography.Text>
                                    <br />
                                    <Typography.Text>
                                        {address?.postcode} {address?.country}
                                    </Typography.Text>
                                </div>
                            </div>

                            <Divider />

                            {/* SHIPPING */}
                            <div>
                                <Typography.Text type="secondary">
                                    {t('Shipping method')}
                                </Typography.Text>

                                <div style={{ marginTop: 6 }}>
                                    <Space>
                                        <Image
                                            preview={false}
                                            src={selectedRate?.providerImage75}
                                            width={40}
                                        />

                                        <div>
                                            <Typography.Text strong>
                                                {selectedRate?.provider}
                                            </Typography.Text>
                                            <br />
                                            <Typography.Text>
                                                {selectedRate?.servicelevel?.name}
                                            </Typography.Text>
                                        </div>
                                    </Space>
                                </div>
                            </div>

                            <Divider />

                            {/* PRICE */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between' 
                            }}>
                                <Typography.Text>{t('Shipping')}</Typography.Text>
                                <Typography.Text>
                                    {selectedRate?.amountLocal} {selectedRate?.currencyLocal}
                                </Typography.Text>
                            </div>

                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between' 
                            }}>
                                <Typography.Text strong>{t('Total')}</Typography.Text>
                                <Typography.Text strong>
                                    {'123.00'} GBP
                                </Typography.Text>
                            </div>

                        </Space>
                    </Card>
                </Space>
            )

        case CheckoutStep.Payment:
            return (
                <Space orientation="vertical" size="large" style={{ width: '100%' }}>
                    <Title level={4}>{t('Payment')}</Title>
                    <Paragraph>
                            Payment
                    </Paragraph>
                </Space>
            )
        }
    }

    return (
        <Card style={{
            maxWidth: 900,
            margin: '40px auto' 
        }}>
            <Title level={2}>Checkout</Title>

            <Steps
                current={currentStep}
                items={[
                    { title: t('Customer') },
                    { title: t('Address') },
                    { title: t('Shipping') },
                    { title: t('Order') },
                    { title: t('Payment') }
                ]}
            />

            <Divider />

            { loading ? <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: 200
                }}
            >
                <Spin />
            </div> : renderStep()}

            <Divider />

            <Space
                style={{
                    width: '100%',
                    justifyContent: 'space-between'
                }}
            >
                <Button
                    disabled={currentStep === CheckoutStep.Customer}
                    onClick={previous}
                >
                    Back
                </Button>

                {currentStep !== CheckoutStep.Payment && (
                    <Button type="primary" onClick={handleNext}>
                        Continue
                    </Button>
                )}

                {currentStep === CheckoutStep.Payment && (
                    <Button type="primary">Pay</Button>
                )}
            </Space>
        </Card>
    )
}