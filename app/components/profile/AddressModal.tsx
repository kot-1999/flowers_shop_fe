'use client'

import { Modal, Form, Input, Checkbox, Select, message } from 'antd'
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react'

import { Country, LocalStorageKey } from '@/app/utils/enums'
import { checkRes, getLocalStorage, getTFunc } from '@/app/utils/helpers'

const AddressModal = forwardRef(function AddressModal(
    {
        open,
        address,
        onClose,
        onSuccess,
        useForm = false
    }: any,
    ref
) {
    const [form] = Form.useForm()
    const t = getTFunc()

    useEffect(() => {
        if (address) {
            form.setFieldsValue(address)
        } else {
            form.resetFields()
        }
    }, [address, open])

    useImperativeHandle(ref, () => ({
        submit: async () => {
            try {
                const values = await form.validateFields()
                await handleSubmit(values)
            } catch {}
        }
    }))

    const handleSubmit = async (values: any) => {
        try {

            const checkoutToken = getLocalStorage(LocalStorageKey.CheckoutToken)
            const headers: any = {
                'Content-Type': 'application/json'
            }
            if (checkoutToken) {
                headers['Authorization'] = `Bearer ${checkoutToken}`
            }

            const res = await fetch('/api/addresses', {
                method: 'PUT',
                headers,
                body: JSON.stringify({
                    addressID: address?.id,
                    ...values
                })
            })

            const data = await res.json()
            const isSuccess = await checkRes(res, data, t('Failed to save address'))
            if (isSuccess) {
                onSuccess?.({
                    ...values,
                    id: data.address.id 
                })
            }

        } catch {
            message.error(t('Failed to save address'))
        }
    }

    const FormContent = (
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Form.Item name="country" label={t('Country')} required>
                <Select
                    options={Object.values(Country).map((val) => ({
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

            { !useForm
                && <Form.Item name="isDefault" valuePropName="checked">
                    <Checkbox>{t('Default address')}</Checkbox>
                </Form.Item>
            }
        </Form>
    )

    if (useForm) {
        return FormContent
    }

    return (
        <Modal
            open={open}
            title={address ? t('Edit address') : t('Add address')}
            onCancel={onClose}
            onOk={() => form.submit()}
            okText={t('Save')}
        >
            {FormContent}
        </Modal>
    )
})

export default AddressModal