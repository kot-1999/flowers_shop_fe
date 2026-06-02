'use client';

import {Form, Input, Button, Card, Tabs, message, Divider} from "antd";
import {useRouter} from "next/navigation";
import {useState} from "react";
import {useAuth} from "@/app/components/AuthContent";
import {GoogleOutlined} from "@ant-design/icons";

export default function AuthCard() {
    const { checkAuth } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('login');

    const onLoginFinish = (values: unknown) => {
        onFinish(values, 'login');
    }

    const onRegisterFinish = (values: unknown) => {
        onFinish(values, 'register');
    }

    const onFinish = async (values: any, mode: 'login' | 'register') => {
        try {
            const payload = { ...values, mode };
            const res = mode === 'login' ? await fetch("/api/auth/login", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: payload.email,
                    password: payload.password,
                }),
            }) : await fetch("/api/auth/register", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: payload.email,
                    password: payload.password,
                    firstName: payload.firstName,
                    lastName: payload.lastName,
                }),
            })

            const data = await res.json();
            await checkAuth()

            if (res.ok) {
                message.success(`${mode === 'login' ? 'Login' : 'Registration'} successful`);

                if (mode === 'register') {
                    setActiveTab('login');
                } else {
                    router.push('/');
                }
            } else {
                if (data.messages) {
                    data.messages.forEach((msg: string) => message.error(msg))
                } else if (data.message) {
                    message.error(data.message);
                } else {
                    throw new Error(data)
                }
            }
        } catch (err: any) {
            message.error(err.message)
        }
    };

    const items = [
        {
            key: "login",
            label: "Login",
            children: (
                <Form layout="vertical" onFinish={onLoginFinish}>
                    <Form.Item
                        label="Email"
                        name="email"
                        rules={[
                            { required: true, message: "Email required" },
                            { type: "email" },
                        ]}
                    >
                        <Input placeholder="email@example.com" />
                    </Form.Item>

                    <Form.Item
                        label="Password"
                        name="password"
                        rules={[{ required: true, message: "Password required" }]}
                    >
                        <Input.Password />
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="link"
                            onClick={() => router.push('/pages/auth/forgot-password')}
                            style={{ padding: 0 }}
                        >
                            Forgot password?
                        </Button>
                    </Form.Item>

                    <Button type="primary" htmlType="submit" block>
                        Login
                    </Button>
                </Form>
            ),
        },
        {
            key: "register",
            label: "Register",
            children: (
                <Form layout="vertical" onFinish={onRegisterFinish}>
                    <Form.Item
                        label="First Name"
                        name="firstName"
                        rules={[{ required: true, message: "Name required" }]}
                    >
                        <Input placeholder="John" />
                    </Form.Item>

                    <Form.Item
                        label="Last Name"
                        name="lastName"
                        rules={[{ required: true, message: "Name required" }]}
                    >
                        <Input placeholder="Doe" />
                    </Form.Item>

                    <Form.Item
                        label="Email"
                        name="email"
                        rules={[
                            { required: true, message: "Email required" },
                            { type: "email" },
                        ]}
                    >
                        <Input placeholder="email@example.com" />
                    </Form.Item>

                    <Form.Item
                        label="Password"
                        name="password"
                        rules={[{ required: true, message: "Password required" }]}
                    >
                        <Input.Password />
                    </Form.Item>

                    <Form.Item
                        label="Repeat password"
                        name="passwordRepeat"
                        dependencies={["password"]}
                        rules={[
                            { required: true, message: "Please repeat password" },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue("password") === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(
                                        new Error("Passwords do not match")
                                    );
                                },
                            }),
                        ]}
                    >
                        <Input.Password />
                    </Form.Item>

                    <Button type="primary" size="large" htmlType="submit" block>
                        Register
                    </Button>
                </Form>
            ),
        },
    ];

    return (
        <div
            style={{
                display: "flex",
                justifyContent: "center",
                paddingTop: 80,
            }}
        >
            <Card title="Authorization" style={{ width: 400 }}>
                <Tabs activeKey={activeTab} onChange={setActiveTab} items={items} centered />

                <Divider>OR</Divider>

                <Button
                    block
                    size="large"
                    icon={<GoogleOutlined />}
                    onClick={() => {
                        window.location.href = '/api/auth/google'
                    }}
                >
                    Continue with Google
                </Button>
            </Card>
        </div>
    );
}