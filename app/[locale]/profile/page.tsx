'use client'

import { Card, Spin, Tabs } from 'antd'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { useAuth } from '@/app/components/AuthContent'
import AddressList from '@/app/components/profile/AddressList'
import ProfileForm from '@/app/components/profile/ProfileForm'
import { fetchUser } from '@/app/utils/clientFetchFuntions'
import { getTFunc } from '@/app/utils/helpers'

export default function ProfilePage() {
    const t = getTFunc()
    const router = useRouter()
    const { user: authUser } = useAuth()

    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        fetchUser(authUser, setLoading, setUser, router)
    }, [authUser])

    if (loading || !user) {
        return (
            <Card style={{
                maxWidth: 900,
                margin: '0 auto'
            }}>
                <Spin />
            </Card>
        )
    }

    return (
        <Card style={{
            maxWidth: 900,
            margin: '0 auto'
        }}>
            <Tabs
                centered
                items={[
                    {
                        key: 'profile',
                        label: t('Profile'),
                        children: (
                            <ProfileForm
                                user={user}
                                authUser={authUser}
                            />
                        )
                    },
                    {
                        key: 'addresses',
                        label: t('Addresses'),
                        children: <AddressList />
                    }
                ]}
            />
        </Card>
    )
}