'use client'

import { useEffect, useState } from 'react'
import { Card, Input, Button, Form, Spin } from 'antd'
import { useRouter } from 'next/navigation'

export default function CompleteRegistrationPage() {
    const [loading, setLoading] = useState(false)
    const [user, setUser] = useState<any>(null)
    const router = useRouter()

    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetch('/api/auth/me', { method: 'GET' })

                if (!res.ok) {
                    setUser(false)
                    return
                }

                const data = await res.json()
                setUser(data)
            } catch {
                setUser(false)
            }
        }

        load()
    }, [])

    const onFinish = async (values: any) => {
        setLoading(true)

        const res = await fetch('/api/auth/complete-registration', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                firstName: values.firstName,
                lastName: values.lastName,
                password: values.password,
            }),
        })

        setLoading(false)

        if (res.ok) router.push('/')
    }

    if (!user) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
                <Spin />
            </div>
        )
    }

    return (
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
            <Card title="Complete registration" style={{ width: 420 }}>
                <Form
                    layout="vertical"
                    onFinish={onFinish}
                    initialValues={{
                        firstName: user.firstName,
                        lastName: user.lastName,
                    }}
                >
                    <Form.Item label="Email">
                        <Input value={user.email} disabled />
                    </Form.Item>

                    <Form.Item
                        name="firstName"
                        label="First name"
                        rules={[{ required: true }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="lastName"
                        label="Last name"
                        rules={[{ required: true }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        label="Password"
                        rules={[{ required: true }]}
                        hasFeedback
                    >
                        <Input.Password />
                    </Form.Item>

                    <Form.Item
                        name="passwordRepeat"
                        label="Repeat password"
                        dependencies={['password']}
                        hasFeedback
                        rules={[
                            { required: true },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('password') === value) {
                                        return Promise.resolve()
                                    }
                                    return Promise.reject(
                                        new Error('Passwords do not match')
                                    )
                                },
                            }),
                        ]}
                    >
                        <Input.Password />
                    </Form.Item>

                    <Button type="primary" htmlType="submit" loading={loading} block>
                        Finish
                    </Button>
                </Form>
            </Card>
        </div>
    )
}