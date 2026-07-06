'use client'

import {
    Button,
    Card,
    Col,
    Divider,
    Form,
    Input,
    Row,
    Select,
    Space,
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

    const [shippingRates, setShippingRates] = useState<any[]>([])
    const [selectedRate, setSelectedRate] = useState<any>(null)

    const [customer, setCustomer] = useState({
        firstName: '',
        lastName: '',
        email: ''
    })
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

        const checkoutToken = getLocalStorage(LocalStorageKey.CheckoutToken)
        const headers: any = {
            'Content-Type': 'application/json'
        }
        if (checkoutToken) {
            headers['Authorization'] = `Bearer ${checkoutToken}`
        }

        const loadRates = async () => {
            const res = await fetch('/api/shipping', {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    addressID: address.id
                })
            })
            const data = await res.json()

            setShippingRates(data.rates ?? [])

            if (data.rates?.length) {
                setSelectedRate(data.rates[0]) // default selection
            }
            console.log(data, res)
        }

        loadRates()
    }, [currentStep, address])

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
            setCurrentStep(CheckoutStep.Shipping)
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
                            <Form.Item label="First name" required>
                                <Input
                                    value={customer.firstName}
                                    onChange={(e) =>
                                        setCustomer({
                                            ...customer,
                                            firstName:
                                                e.target.value
                                        })
                                    }
                                />
                            </Form.Item>
                        </Col>

                        <Col span={12}>
                            <Form.Item label="Last name" required>
                                <Input
                                    value={customer.lastName}
                                    onChange={(e) =>
                                        setCustomer({
                                            ...customer,
                                            lastName:
                                                e.target.value
                                        })
                                    }
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item label="Email" required>
                        <Input
                            value={customer.email}
                            onChange={(e) =>
                                setCustomer({
                                    ...customer,
                                    email: e.target.value
                                })
                            }
                        />
                    </Form.Item>
                </Form>
            )

        case CheckoutStep.Address:
            return (
                <Space
                    direction="vertical"
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
                <Space orientation="vertical" size="large" style={{ width: '100%' }}>
                    <Title level={4}>{t('Shipping')}</Title>
                    <Paragraph>
                            Display available shipping rates
                    </Paragraph>
                </Space>
            )

        case CheckoutStep.Order:
            return (
                <Space orientation="vertical" size="large" style={{ width: '100%' }}>
                    <Title level={4}>{t('Order')}</Title>
                    <Paragraph>
                            Review order
                    </Paragraph>
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

            {renderStep()}

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