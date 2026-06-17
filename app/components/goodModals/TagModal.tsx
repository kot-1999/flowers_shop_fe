'use client'
import { Button, Form, Input, message, Modal, Tabs } from 'antd'
import { useEffect, useMemo, useRef, useState } from 'react'

import { Language } from '@/app/utils/enums'
import { getTFunc } from '@/app/utils/helpers'

interface Tag {
    id: string;
    nameTID?: string;
    name: Record<Language, string>;
    createdAt?: string;
    updatedAt?: string;
}

interface Props {
    open: boolean;
    tag: Tag | null;
    settings: {
        locale: Language;
    };
    onClose: () => void;
    onSuccess: () => void;
}

interface FormValues {
    nameTranslations: Record<Language, string>;
}

export default function TagModal({
    open,
    tag,
    settings,
    onClose,
    onSuccess
}: Props) {
    const t = getTFunc()
    const [form] = Form.useForm<FormValues>()

    const [loading, setLoading] = useState(false)
    const [aiLoading, setAiLoading] = useState(false)
    const [activeLanguage, setActiveLanguage] = useState<Language>(settings.locale)

    const originalTranslations = useRef<Record<Language, string> | null>(null)
    const [nameTranslations, setNameTranslations] = useState({})

    const emptyTranslations = useMemo(() => {
        return Object.values(Language).reduce((acc, lang) => {
            acc[lang] = ''
            return acc
        }, {} as Record<Language, string>)
    }, [])

    useEffect(() => {
        if (!open) {return}

        setActiveLanguage(settings.locale)

        if (!tag) {
            originalTranslations.current = null

            form.resetFields()
            form.setFieldsValue({
                nameTranslations: emptyTranslations
            })

            return
        }

        originalTranslations.current = tag.name
        setNameTranslations(originalTranslations.current)

        form.setFieldsValue({
            nameTranslations: tag.name
        })
    }, [open, tag, settings.locale, form, emptyTranslations])

    const generateTranslations = async () => {
        try {
            const values = form.getFieldsValue()
            const sourceText = values?.nameTranslations?.[activeLanguage]

            if (!sourceText) {
                message.warning(t('Enter text first'))
                return
            }

            setAiLoading(true)

            const res = await fetch('/api/ai/translations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: [sourceText] })
            })

            const data = await res.json()

            if (!res.ok) {
                message.error(data?.message || t('AI translation failed'))
                return
            }

            const translations = data?.translations?.[0]

            const current = form.getFieldValue('nameTranslations') || {}

            const updatedNameTranslations =  {
                ...current,
                ...translations
            }

            form.setFieldsValue(updatedNameTranslations)
            setNameTranslations(updatedNameTranslations)

            message.success(t('Translations generated'))
        } catch {
            message.error(t('AI translation failed'))
        } finally {
            setAiLoading(false)
        }
    }

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields()
            setLoading(true)

            const translationsChanged = JSON.stringify({
                ...nameTranslations,
                ...values.nameTranslations
            }) !== JSON.stringify(originalTranslations.current)

            const body: Record<string, unknown> = {}

            if (tag?.id) {
                body.tagID = tag.id
            }

            if (tag?.nameTID && !translationsChanged) {
                body.nameTID = tag.nameTID
            } else {
                body.nameTranslations = {
                    ...nameTranslations,
                    ...values.nameTranslations,
                    id: undefined
                }
            }

            const res = await fetch('/api/admin/tags', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            })

            const data = await res.json()

            if (!res.ok) {
                if (data.message) {
                    message.error(data.message)
                } else if (data.messages) {
                    data.messages.forEach((item: string) =>
                        message.error(item))
                } else {
                    message.error(t('Failed to save tag'))
                }

                return
            }

            message.success(data?.message || (tag ? t('Tag updated') : t('Tag created')))

            onSuccess()
        } catch {
            message.error(t('Failed to save tag'))
        } finally {
            setLoading(false)
        }
    }

    return (
        <Modal
            open={open}
            onCancel={onClose}
            destroyOnHidden
            width={600}
            title={tag ? t('Edit Tag') : t('Create Tag')}
            footer={[
                <Button key="cancel" onClick={onClose}>
                    {t('Cancel')}
                </Button>,

                <Button
                    key="ai"
                    onClick={generateTranslations}
                    loading={aiLoading}
                >
                    {t('Generate translations')}
                </Button>,

                <Button
                    key="submit"
                    type="primary"
                    loading={loading}
                    onClick={handleSubmit}
                >
                    {tag ? t('Update Tag') : t('Create Tag')}
                </Button>
            ]}
        >
            <Form form={form} layout="vertical">
                <Tabs
                    type="card"
                    activeKey={activeLanguage}
                    onChange={(key) =>
                        setActiveLanguage(key as Language)
                    }
                    items={Object.values(Language).map((lang) => ({
                        key: lang,
                        label: lang.toUpperCase(),
                        children: (
                            <Form.Item
                                name={[
                                    'nameTranslations',
                                    lang
                                ]}
                                label={t('Name')}
                                rules={[
                                    {
                                        required: true,
                                        message: t('Name is required')
                                    }
                                ]}
                            >
                                <Input />
                            </Form.Item>
                        )
                    }))}
                />
            </Form>
        </Modal>
    )
}