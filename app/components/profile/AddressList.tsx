'use client'

import { Button, Space, Spin, message } from 'antd'
import { useEffect, useState } from 'react'

import { fetchAddresses } from '@/app/utils/clientFetchFuntions'
import { checkRes, getTFunc } from '@/app/utils/helpers'

import AddressCard from './AddressCard'
import AddressModal from './AddressModal'

export default function AddressList() {
    const t = getTFunc()

    const [addresses, setAddresses] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false)
    const [editing, setEditing] = useState<any | null>(null)

    useEffect(() => {
        fetchAddresses(setAddresses, setLoading, t)
    }, [])

    const handleDelete = async (id: string) => {
        try {
            const res = await fetch(`/api/addresses/${id}`, {
                method: 'DELETE'
            })

            const data = await res.json()

            const isSuccess = await checkRes(res, data, t('Failed to delete'))

            if (isSuccess) {
                fetchAddresses(setAddresses, setLoading, t)
            }
        } catch {
            message.error(t('Failed to delete'))
        }
    }

    return (
        <div>
            <Space style={{ marginBottom: 16 }}>
                <Button type="primary" onClick={() => setOpen(true)}>
                    {t('Add address')}
                </Button>
            </Space>

            {loading ? (
                <Spin />
            ) : (
                <Space orientation="vertical" style={{ width: '100%' }}>
                    {addresses.map((addr: any) => (
                        <AddressCard
                            key={addr.id}
                            address={addr}
                            onEdit={(a: any) => {
                                setEditing(a)
                                setOpen(true)
                            }}
                            onDelete={handleDelete}
                        />
                    ))}
                </Space>
            )}

            <AddressModal
                open={open}
                address={editing}
                onClose={() => {
                    setOpen(false)
                    setEditing(null)
                }}
                onSuccess={() => {
                    setOpen(false)
                    setEditing(null)
                    fetchAddresses(setAddresses, setLoading, t)
                }}
            />
        </div>
    )
}