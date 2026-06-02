'use client';

import { Form, Input, Button, Card, message, Result } from "antd";
import { MailOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ForgotPasswordForm() {
    const router = useRouter();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [submittedEmail, setSubmittedEmail] = useState('');

    const onFinish = async (values: any) => {
        setLoading(true);
        try {
            const res = await fetch("/api/auth/forgot-password", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: values.email,
                }),
            });

            const data = await res.json();

            if (res.ok) {
                setSubmittedEmail(values.email);
                setSubmitted(true);
                message.success('Password reset email sent successfully');
            } else {
                message.error(data.message || 'Failed to send reset email');
            }
        } catch (err: any) {
            message.error(err.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: "100vh",
                }}
            >
                <Card style={{ width: 400 }} bordered={false}>
                    <Result
                        status="success"
                        title="Check Your Email"
                        subTitle={`We've sent a password reset link to ${submittedEmail}`}
                        extra={[
                            <Button
                                key="back"
                                type="primary"
                                onClick={() => router.push('/')}
                            >
                                Back to Login
                            </Button>,
                            <Button
                                key="new-email"
                                onClick={() => {
                                    setSubmitted(false);
                                    form.resetFields();
                                }}
                            >
                                Try Another Email
                            </Button>,
                        ]}
                    />
                </Card>
            </div>
        );
    }

    return (
        <div
            style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "100vh",
            }}
        >
            <Card
                title={<><MailOutlined /> Forgot Password</>}
                style={{ width: 400 }}
            >
                <p style={{ marginBottom: 24, color: '#666' }}>
                    Enter your email address and we'll send you a link to reset your password.
                </p>

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    requiredMark="optional"
                >
                    <Form.Item
                        label="Email"
                        name="email"
                        rules={[
                            { required: true, message: "Email is required" },
                            { type: "email", message: "Please enter a valid email" },
                        ]}
                    >
                        <Input
                            placeholder="email@example.com"
                            size="large"
                            type="email"
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
                            Send Reset Link
                        </Button>
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="link"
                            block
                            icon={<ArrowLeftOutlined />}
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