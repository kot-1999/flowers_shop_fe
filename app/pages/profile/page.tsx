'use client';

import { useAuth } from '@/app/components/AuthContent';
import { useRouter } from 'next/navigation';
import { Card, Button, Descriptions, message, Modal, Form, Input, Spin } from 'antd';
import { EditOutlined, DeleteOutlined, LogoutOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useState, useEffect } from 'react';

export default function ProfilePage() {
    const { user: authUser, checkAuth } = useAuth();
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchUser();
    }, [authUser?.id]);

    const fetchUser = async () => {
        try {
            if (!authUser) {
                throw new Error('Not authorized');
            }
            setLoading(true);
            const res = await fetch(`/api/users/${authUser.id}`);
            if (res.ok) {
                const data = await res.json();
                setUser(data.user);
                form.setFieldsValue(data.user);
            } else {
                router.push('/');
            }
        } catch (err) {
            router.push('/');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = async (values: any) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/users/${user.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(values),
            });

            if (res.ok) {
                message.success('Profile updated');
                setEditOpen(false);
                await fetchUser();
            } else {
                message.error('Failed to update');
            }
        } catch (err: any) {
            message.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/users/${user.id}`, { method: 'DELETE' });
            if (res.ok) {
                message.success('Account deleted');
                router.push('/');
            } else {
                message.error('Failed to delete');
            }
        } catch (err: any) {
            message.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            await checkAuth()
            router.push('/');
        } catch (err: any) {
            message.error(err.message);
        }
    };

    if (!user) return <Spin />;

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '20px' }}>
            <Card
                title="My Profile"
                style={{ width: '100%', maxWidth: 600 }}
                extra={
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <Button icon={<EditOutlined />} onClick={() => setEditOpen(true)}>Edit</Button>
                        <Button danger icon={<DeleteOutlined />} onClick={() => setDeleteOpen(true)}>Delete</Button>
                        <Button danger icon={<LogoutOutlined />} onClick={handleLogout}>Logout</Button>
                    </div>
                }
            >
                <Descriptions bordered column={1}>
                    <Descriptions.Item label="ID"><code>{user.id}</code></Descriptions.Item>
                    <Descriptions.Item label="Name">{user.firstName} {user.lastName}</Descriptions.Item>
                    <Descriptions.Item label="Email">{user.email}</Descriptions.Item>
                    <Descriptions.Item label="Role">{user.role}</Descriptions.Item>
                    <Descriptions.Item label="Member Since">{dayjs(user.createdAt).format('MMM DD, YYYY')}</Descriptions.Item>
                </Descriptions>
            </Card>

            <Modal title="Edit Profile" open={editOpen} onOk={form.submit} onCancel={() => setEditOpen(false)} confirmLoading={loading}>
                <Form form={form} layout="vertical" onFinish={handleEdit}>
                    <Form.Item label="First Name" name="firstName" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item label="Last Name" name="lastName" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>

            <Modal title="Delete Account" open={deleteOpen} onOk={handleDelete} onCancel={() => setDeleteOpen(false)} confirmLoading={loading} okButtonProps={{ danger: true }}>
                <p>This action cannot be undone.</p>
            </Modal>
        </div>
    );
}