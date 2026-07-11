'use client'

import { Elements } from '@stripe/react-stripe-js'
import {
    Button,
    Card,
    Col,
    Divider,
    Form, Image,
    Input, message,
    Radio, Result,
    Row,
    Select,
    Space, Spin,
    Steps,
    Typography
} from 'antd'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

import { useAuth } from '@/app/components/AuthContent'
import BasketItem from '@/app/components/BasketItem'
import PaymentForm from '@/app/components/PaymentForm'
import AddressModal from '@/app/components/profile/AddressModal'
import {
    fetchAddresses, fetchCart,
    fetchUser, getInvoice, loginOrRegister, saveCartChanges
} from '@/app/utils/clientFetchFuntions'
import { LocalStorageKey } from '@/app/utils/enums'
import {
    checkRes, deleteItem, getLocalStorage,
    getTFunc,
    setLocalStorage, updateItem
} from '@/app/utils/helpers'
import { stripePromise } from '@/app/utils/stripeService'

const { Title, Paragraph } = Typography

enum CheckoutStep {
    Customer = 0,
    Address,
    BasketReview,
    Shipping,
    Payment
}

export default function Checkout() {
    const router = useRouter()
    const [currentStep, setCurrentStep] = useState(CheckoutStep.Customer)
    const { user: authUser, checkAuth } = useAuth()
    const t = getTFunc()
    const [loading, setLoading] = useState(false)

    // User data
    const [user, setUser] = useState<any>(null)
    const [form] = Form.useForm()
    const [customer, setCustomer] = useState({
        firstName: '',
        lastName: '',
        email: ''
    })

    // Address data
    const [addresses, setAddresses] = useState<any[]>([])
    const [address, setAddress] = useState<any>(null)
    const addressRef = useRef<any>(null)
    const [addressKey, setAddressKey] = useState<string | null>(null)

    // Shipping info
    const [shipping, setShipping] = useState<any>(null)
    const [selectedRate, setSelectedRate] = useState<any>(null)

    // Cart
    const [cartData, setCartData] = useState<any>(null)
    const [editMode, setEditMode] = useState(false)
    const [pendingUpdates, setPendingUpdates] = useState<Record<string, any>>({})
    const [pendingDeletes, setPendingDeletes] = useState<Record<string, any>>({})

    // Payment
    const [clientSecret, setClientSecret] = useState<string>()
    const [orderID, setOrderID] = useState<string>()
    const [paymentSuccess, setPaymentSuccess] = useState(false)

    // Invoice
    const [invoiceLoading, setInvoiceLoading] = useState(false)

    // Register user after order
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [creatingAccount, setCreatingAccount] = useState(false)

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
        if (currentStep !== CheckoutStep.BasketReview) {return}

        fetchCart(user, setCartData, setLoading, t)
    }, [currentStep])

    useEffect(() => {
        if (currentStep !== CheckoutStep.Payment) {return}
        const createPayment = async () => {
            try {
                const headers: any = {
                    'Content-Type': 'application/json'
                }

                if (!user) {
                    const token = getLocalStorage(LocalStorageKey.CheckoutToken)
                    headers['Authorization'] = `Bearer ${token}`
                }
                const res = await fetch('/api/checkout/order', {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({
                        addressID: address.id,
                        shippingRateID: selectedRate.objectId,
                        recipientFirstName: customer.firstName,
                        recipientLastName: customer.lastName,
                        recipientEmail: customer.email
                    })
                })

                const data = await res.json()

                const ok = await checkRes(
                    res,
                    data,
                    t('Failed to create order')
                )

                if (!ok) {return}

                setOrderID(data.order.id)
                setClientSecret(data.clientSecret)

                setCurrentStep(CheckoutStep.Payment)
            } catch {
                message.error(t('Failed to create order'))
            }
        }
        createPayment()
    }, [currentStep])

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

    const cancelEdit = () => {
        setPendingUpdates({})
        setPendingDeletes({})
        setEditMode(false)
        fetchCart(user, setCartData, setLoading, t)
    }

    const handleNext = async () => {
        if (currentStep === CheckoutStep.Customer) {
            await form.validateFields()

            const values = form.getFieldsValue()
            setCustomer(values)

            await continueCustomer()

            if (!customer.firstName || !customer.lastName || !customer.email) {
                message.error(t('Customer required fields are missing'))
            }

            setCurrentStep(CheckoutStep.Address)
            return
        } else if (currentStep === CheckoutStep.Address) {
            await addressRef.current?.submit()
            setAddressKey(JSON.stringify({
                country: address?.country,
                city: address?.city,
                street: address?.street,
                building: address?.building,
                apartment: address?.apartment,
                postcode: address?.postcode
            }))
            setCurrentStep(CheckoutStep.BasketReview)
            return
        } else if (currentStep === CheckoutStep.BasketReview) {
            if (editMode) {
                message.warning(t('Finish editing first'))
            }
            setCurrentStep(CheckoutStep.Shipping)
        } else if (currentStep === CheckoutStep.Shipping) {
            if (!selectedRate) {
                message.error(t('Please select a shipping method'))
                return
            }

            setCurrentStep(CheckoutStep.Payment)
        }
    }

    const previous = () => {
        if (currentStep > CheckoutStep.Customer) {
            setCurrentStep((prev) => prev - 1)
        }
    }

    const continueCustomer = async () => {
        if (authUser) {
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
        } finally {
            setLoading(false)
        }
    }

    if (paymentSuccess && orderID) {
        return (
            <Result
                status="success"
                title="Payment successful!"
                subTitle="Your order has been placed successfully."
                extra={[
                    <Space
                        key="actions"
                        orientation="vertical"
                        size="large"
                        style={{
                            width: '100%',
                            alignItems: 'center'
                        }}
                    >
                        <Space
                            orientation="vertical"
                            size="small"
                            style={{
                                textAlign: 'center'
                            }}
                        >
                            <Typography.Text type="secondary">
                                Order ID
                            </Typography.Text>

                            <Typography.Text copyable>
                                {orderID}
                            </Typography.Text>
                        </Space>

                        <Button
                            type="primary"
                            loading={invoiceLoading}
                            onClick={() => getInvoice(orderID, setInvoiceLoading, t)}
                        >
                            Download invoice
                        </Button>

                        {!user && (
                            <Card
                                style={{
                                    width: '100%',
                                    maxWidth: 500,
                                    marginTop: 24
                                }}
                            >
                                <Space
                                    orientation="vertical"
                                    size="middle"
                                    style={{
                                        width: '100%'
                                    }}
                                >
                                    <Title level={4}>
                                        Create your customer account 🎁
                                    </Title>

                                    <Typography.Paragraph>
                                        Your order was placed using{' '}
                                        <Typography.Text strong>
                                            {customer.email}
                                        </Typography.Text>
                                        .
                                        <br />
                                        Create a password now to unlock order tracking,
                                        manage your orders, download invoices anytime,
                                        and access your purchase history.
                                    </Typography.Paragraph>

                                    <Input.Password
                                        placeholder="Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />

                                    <Input.Password
                                        placeholder="Confirm password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />

                                    <Button
                                        type="primary"
                                        block
                                        loading={creatingAccount}
                                        onClick={async () => {
                                            if (password.length < 7) {
                                                message.error(t('Password must contain at least 7 characters'))
                                                return
                                            }

                                            if (password !== confirmPassword) {
                                                message.error(t('Passwords do not match'))
                                                return
                                            }

                                            setCreatingAccount(true)

                                            try {
                                                const isOk = await loginOrRegister({
                                                    firstName: customer.firstName,
                                                    lastName: customer.lastName,
                                                    email: customer.email,
                                                    password: password
                                                }, 'register', checkAuth, router, t)

                                                if (isOk) {
                                                    message.success(t('Account created successfully. You may sign in now.'))
                                                    router.replace('/auth/login')
                                                }
                                            } finally {
                                                setCreatingAccount(false)
                                            }
                                        }}
                                    >
                                        Create account
                                    </Button>

                                    <Typography.Text type="secondary">
                                        You can also continue shopping without creating an account.
                                    </Typography.Text>
                                </Space>
                            </Card>
                        )}

                        <Button
                            onClick={() => {
                                router.push('/' + t('all-categories'))
                            }}
                        >
                            Continue shopping
                        </Button>
                    </Space>
                ]}
            />
        )
    }

    const editButton = () => <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
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
                    <Title level={4}>{t('Cart review')}</Title>

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
                                                    {rate.amount} {rate.currency}
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

        case CheckoutStep.BasketReview:
            return (
                <Space orientation="vertical" size="large" style={{ width: '100%' }}>
                    {!!cartData?.basketItems?.length && (
                        <>
                            {editButton()}

                            <Title level={4}>{t('Purchasing items')}</Title>

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

                            {editButton()}

                        </>
                    )}
                </Space>
            )

        case CheckoutStep.Payment:
            return (
                <Space
                    orientation="vertical"
                    size="large"
                    style={{ width: '100%' }}
                >
                    <Title level={4}>{t('Payment')}</Title>
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

                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between'
                            }}>
                                <Typography.Text>{t('Shipping')}</Typography.Text>
                                <Typography.Text>
                                    {selectedRate?.amountLocal} £
                                </Typography.Text>
                            </div>

                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between'
                            }}>
                                <Typography.Text>{t('Products')}</Typography.Text>
                                <Typography.Text>
                                    {cartData?.summary?.totalPrice} £
                                </Typography.Text>
                            </div>

                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between'
                            }}>
                                <Typography.Text strong>{t('Total')}</Typography.Text>
                                <Typography.Text strong>
                                    {Math.round((Number(cartData?.summary?.totalPrice) + Number(selectedRate?.amountLocal)) * 100) / 100} £
                                </Typography.Text>
                            </div>

                        </Space>
                    </Card>

                    {clientSecret && (
                        <Elements
                            stripe={stripePromise}
                            options={{
                                clientSecret
                            }}
                        >
                            <PaymentForm
                                onSuccess={() => setPaymentSuccess(true)}
                            />
                        </Elements>
                    )}
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
                    { title: t('Cart Review') },
                    { title: t('Shipping method') },
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
            </Space>
        </Card>
    )
}