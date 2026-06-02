'use client';

import { Form, Input, Button, Card, message, Spin, Result } from "antd";
import { LockOutlined } from "@ant-design/icons";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

export default function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [token, setToken] = useState('');
    const [tokenValid, setTokenValid] = useState(true);

    useEffect(() => {
        const jwtToken = searchParams.get('token');
        if (!jwtToken) {
            setTokenValid(false);
            message.error('No reset token provided');
            return;
        }
        setToken(jwtToken);
    }, [searchParams]);

    const onFinish = async (values: any) => {
        if (values.newPassword !== values.confirmPassword) {
            message.error('Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/auth/reset-password", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    newPassword: values.newPassword,
                }),
            });

            const data = await res.json();

            if (res.ok) {
                message.success('Password reset successfully');
                setTimeout(() => {
                    router.push('/');
                }, 1500);
            } else {
                message.error(data.message || 'Failed to reset password');
            }
        } catch (err: any) {
            message.error(err.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    if (!tokenValid) {
        return (
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '100vh',
                }}
            >
                <Card style={{ width: 450 }}>
                    <Result
                        status="error"
                        title="Invalid Token"
                        subTitle="The password reset link is invalid or has expired."
                        extra={
                            <Button type="primary" size="large" onClick={() => router.push('/')}>
                                Back to Login
                            </Button>
                        }
                    />
                </Card>
            </div>
        );
    }

    if (!token) {
        return (
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '100vh',
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                }}
            >
                <Spin size="large" tip="Loading..." />
            </div>
        );
    }

    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
            }}
        >
            <Card
                title={<><LockOutlined /> Reset Password</>}
                style={{ width: 450, boxShadow: "0 8px 24px rgba(0,0,0,0.15)" }}
                bordered={false}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    requiredMark="optional"
                    autoComplete="off"
                >
                    <Form.Item
                        label="New Password"
                        name="newPassword"
                        rules={[
                            { required: true, message: "Please enter new password" },
                            { min: 3, message: "Password must be at least 3 characters" },
                        ]}
                    >
                        <Input.Password
                            placeholder="Enter new password"
                            size="large"
                            autoComplete="new-password"
                        />
                    </Form.Item>

                    <Form.Item
                        label="Confirm Password"
                        name="confirmPassword"
                        dependencies={['newPassword']}
                        rules={[
                            { required: true, message: "Please confirm your password" },
                            { min: 3, message: "Password must be at least 3 characters" },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('newPassword') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(
                                        new Error('Passwords do not match')
                                    );
                                },
                            }),
                        ]}
                    >
                        <Input.Password
                            placeholder="Confirm new password"
                            size="large"
                            autoComplete="new-password"
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            block
                            size="large"
                            loading={loading}
                        >
                            Reset Password
                        </Button>
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="link"
                            block
                            size="large"
                            onClick={() => router.push('/')}
                        >
                            Back to Login
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
}