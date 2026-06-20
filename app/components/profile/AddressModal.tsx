'use client'

import { Modal, Form, Input, Checkbox, Select, message } from 'antd'
import { useEffect } from 'react'

import { getTFunc } from '@/app/utils/helpers'
import {Country} from "@/app/utils/enums";

export default function AddressModal({
    open,
    address,
    onClose,
    onSuccess
}: any) {
    const [form] = Form.useForm()
    const t = getTFunc()

    useEffect(() => {
        if (address) {
            form.setFieldsValue(address)
        } else {
            form.resetFields()
        }
    }, [address, open])

    const handleSubmit = async (values: any) => {
        try {
            const res = await fetch('/api/addresses', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    addressID: address?.id,
                    ...values
                })
            })

            if (!res.ok) {throw new Error()}

            message.success(address ? t('Address updated') : t('Address created'))

            onSuccess?.()
        } catch {
            message.error(t('Failed to save address'))
        }
    }

    return (
        <Modal
            open={open}
            title={address ? t('Edit address') : t('Add address')}
            onCancel={onClose}
            onOk={() => form.submit()}
            okText={t('Save')}
        >
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
                <Form.Item name="country" label={t('Country')} required>
                    <Select
                        options={Object.values(Country).map((val ) => ({
                            value: val,
                            label: val
                        }))}
                    />
                </Form.Item>

                <Form.Item name="city" label={t('City')} required>
                    <Input />
                </Form.Item>

                <Form.Item name="street" label={t('Street')} required>
                    <Input />
                </Form.Item>

                <Form.Item name="building" label={t('Building')} required>
                    <Input />
                </Form.Item>

                <Form.Item name="apartment" label={t('Apartment')}>
                    <Input />
                </Form.Item>

                <Form.Item name="postcode" label={t('Postcode')} required>
                    <Input />
                </Form.Item>

                <Form.Item name="isDefault" valuePropName="checked">
                    <Checkbox>{t('Default address')}</Checkbox>
                </Form.Item>
            </Form>
        </Modal>
    )
}