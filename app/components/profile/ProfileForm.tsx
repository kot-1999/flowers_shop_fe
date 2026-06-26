'use client'

import {
    Avatar,
    Button,
    Card,
    Descriptions,
    Form,
    Input,
    Popconfirm,
    Space,
    Tag,
    Typography,
    Upload,
    message
} from 'antd'
import dayjs from 'dayjs'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { useAuth } from '@/app/components/AuthContent'
import { uploadFile } from '@/app/utils/clientFetchFuntions'
import { checkRes, getTFunc } from '@/app/utils/helpers'

interface Props {
    user: any
    authUser: { id: string } | null
    onUpdated?: () => void
}

export default function ProfileForm({ user, authUser, onUpdated }: Props) {
    const router = useRouter()
    const { checkAuth } = useAuth()
    const t = getTFunc()

    const [loading, setLoading] = useState(false)

    const [avatarKey, setAvatarKey] = useState<string | null>(null)
    const [userAvatar, setUserAvatar] = useState<string>(user.avatar)

    const isOwnProfile = authUser?.id === user.id

    // ---------------- UPDATE PROFILE ----------------
    const handleEdit = async (values: any) => {
        setLoading(true)

        try {
            const res = await fetch(`/api/users/${user.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...values,
                    avatar: avatarKey ?? user.avatar
                })
            })

            const data = await res.json()

            const isSuccess = await checkRes(res, data, t('Failed to update'))

            if (isSuccess) {
                onUpdated?.()
            }
        } catch (err: any) {
            message.error(err.message)
        } finally {
            setLoading(false)
        }
    }

    // ---------------- DELETE ACCOUNT ----------------
    const handleDeleteAccount = async () => {
        setLoading(true)

        try {
            const res = await fetch('/api/users', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' }
            })

            const data = await res.json()

            const isSuccess = await checkRes(res, data, t('Failed to delete'))

            if (isSuccess) {
                await checkAuth?.()
                router.push('/')
            }
        } catch (err: any) {
            message.error(err.message)
        } finally {
            setLoading(false)
        }
    }

    // ---------------- LOGOUT ----------------
    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' })
            await checkAuth?.()
            router.push('/')
        } catch (err: any) {
            message.error(err.message)
        }
    }

    return (
        <Card>
            <Space orientation="vertical" size="large" style={{ width: '100%' }}>
                {/* HEADER */}
                <Space>
                    <Avatar size={146} src={userAvatar || undefined}>
                        {user.firstName?.[0]}
                    </Avatar>

                    <div>
                        <Typography.Title level={3} style={{ marginBottom: 0 }}>
                            {user.firstName} {user.lastName}
                        </Typography.Title>

                        { isOwnProfile && <Typography.Text type="secondary">
                            {user.email}
                        </Typography.Text>}
                    </div>
                </Space>

                {/* EDIT FORM */}
                {isOwnProfile && (
                    <Form
                        layout="vertical"
                        initialValues={user}
                        onFinish={handleEdit}
                    >
                        <Form.Item label={t('Avatar')}>
                            <Upload
                                beforeUpload={async (file) => {
                                    try {
                                        const uploaded = await uploadFile(file)

                                        setUserAvatar(uploaded.publicUrl)
                                        setAvatarKey(uploaded.key)
                                    } catch {
                                        message.error(t('Upload failed'))
                                    }

                                    return false
                                }}
                                maxCount={1}
                                onRemove={() => {
                                    setAvatarKey(null)
                                    setUserAvatar(user.avatar)
                                }}
                            >
                                <Button>{t('Upload avatar')}</Button>
                            </Upload>
                        </Form.Item>

                        <Form.Item name="firstName" label={t('First name')}>
                            <Input />
                        </Form.Item>

                        <Form.Item name="lastName" label={t('Last name')}>
                            <Input />
                        </Form.Item>

                        <Button type="primary" htmlType="submit" loading={loading}>
                            {t('Save')}
                        </Button>
                    </Form>
                )}

                {/* INFO */}
                <Descriptions bordered column={1}>
                    <Descriptions.Item label={t('Email verified')}>
                        {user.emailVerified ? (
                            <Tag color="success">{t('Verified')}</Tag>
                        ) : (
                            <Tag color="warning">{t('Not verified')}</Tag>
                        )}
                    </Descriptions.Item>

                    <Descriptions.Item label={t('Role')}>
                        {user.role}
                    </Descriptions.Item>

                    <Descriptions.Item label={t('Member since')}>
                        {dayjs(user.createdAt).format('DD.MM.YYYY')}
                    </Descriptions.Item>

                    <Descriptions.Item label={t('Last updated')}>
                        {dayjs(user.updatedAt).format('DD.MM.YYYY HH:mm')}
                    </Descriptions.Item>
                </Descriptions>

                {/* ACTIONS */}
                {isOwnProfile && (
                    <Space>
                        <Popconfirm
                            title={t('Logout?')}
                            onConfirm={handleLogout}
                        >
                            <Button>
                                {t('Logout')}
                            </Button>
                        </Popconfirm>

                        <Popconfirm
                            title={t('Delete account?')}
                            description={t('This action cannot be undone')}
                            onConfirm={handleDeleteAccount}
                        >
                            <Button danger loading={loading}>
                                {t('Delete Account')}
                            </Button>
                        </Popconfirm>
                    </Space>
                )}
            </Space>
        </Card>
    )
}