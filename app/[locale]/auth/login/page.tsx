'use client'

import { GoogleOutlined } from '@ant-design/icons'
import { Form, Input, Button, Card, Tabs, Divider } from 'antd'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { useAuth } from '@/app/components/AuthContent'
import { loginOrRegister } from '@/app/utils/clientFetchFuntions'
import { getTFunc } from '@/app/utils/helpers'

export default function AuthCard() {
    const { checkAuth } = useAuth()
    const router = useRouter()
    const [activeTab, setActiveTab] = useState('login')
    const t = getTFunc()

    const onLoginFinish = (values: { email: string, firstName: string, lastName: string, password: string }) => {
        loginOrRegister(values, 'login', checkAuth, router, t, setActiveTab)
    }

    const onRegisterFinish = (values: { email: string, firstName: string, lastName: string, password: string }) => {
        loginOrRegister(values, 'register', checkAuth, router, t, setActiveTab)
    }

    const items = [
        {
            key: 'login',
            label: t('Login'),
            children: (
                <Form layout="vertical" onFinish={onLoginFinish}>
                    <Form.Item
                        label={t('Email')}
                        name="email"
                        rules={[
                            {
                                required: true,
                                message: t('Email required') 
                            },
                            { type: 'email' }
                        ]}
                    >
                        <Input placeholder="email@example.com" />
                    </Form.Item>

                    <Form.Item
                        label={t('Password')}
                        name="password"
                        rules={[{
                            required: true,
                            message: t('Password required') 
                        }]}
                    >
                        <Input.Password />
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="link"
                            onClick={() => router.push('/auth/forgot-password')}
                            style={{ padding: 0 }}
                        >
                            {t('Forgot password?')}
                        </Button>
                    </Form.Item>

                    <Button type="primary" htmlType="submit" block>
                        {t('Login')}
                    </Button>
                </Form>
            )
        },
        {
            key: 'register',
            label: t('Register'),
            children: (
                <Form layout="vertical" onFinish={onRegisterFinish}>
                    <Form.Item
                        label={t('First Name')}
                        name="firstName"
                        rules={[{
                            required: true,
                            message: t('Name required') 
                        }]}
                    >
                        <Input placeholder="John" />
                    </Form.Item>

                    <Form.Item
                        label={t('Last Name')}
                        name="lastName"
                        rules={[{
                            required: true,
                            message: t('Name required') 
                        }]}
                    >
                        <Input placeholder="Doe" />
                    </Form.Item>

                    <Form.Item
                        label={t('Email')}
                        name="email"
                        rules={[
                            {
                                required: true,
                                message: t('Email required') 
                            },
                            { type: 'email' }
                        ]}
                    >
                        <Input placeholder="email@example.com" />
                    </Form.Item>

                    <Form.Item
                        label={t('Password')}
                        name="password"
                        rules={[{
                            required: true,
                            message: t('Password required') 
                        }]}
                    >
                        <Input.Password />
                    </Form.Item>

                    <Form.Item
                        label={t('Repeat password')}
                        name="passwordRepeat"
                        dependencies={['password']}
                        rules={[
                            {
                                required: true,
                                message: t('Please repeat password') 
                            },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('password') === value) {
                                        return Promise.resolve()
                                    }
                                    return Promise.reject(new Error(t('Passwords do not match')))
                                }
                            })
                        ]}
                    >
                        <Input.Password />
                    </Form.Item>

                    <Button type="primary" size="large" htmlType="submit" block>
                        {t('Register')}
                    </Button>
                </Form>
            )
        }
    ]

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            paddingTop: 80 
        }}>
            <Card title={t('Authorization')} style={{ width: 400 }}>
                <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    items={items}
                    centered
                />

                <Divider>{t('OR')}</Divider>

                <Button
                    block
                    size="large"
                    icon={<GoogleOutlined />}
                    onClick={() => {
                        window.location.href = '/api/auth/google'
                    }}
                >
                    {t('Continue with Google')}
                </Button>
            </Card>
        </div>
    )
}