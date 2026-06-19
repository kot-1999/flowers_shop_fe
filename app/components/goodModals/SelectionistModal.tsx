'use client'

import {
    Button,
    Form,
    Input,
    message,
    Modal,
    Tabs
} from 'antd'
import { useEffect, useMemo, useRef, useState } from 'react'

import { Language } from '@/app/utils/enums'
import { getTFunc } from '@/app/utils/helpers'
import {generateAndFetchTranslations} from "@/app/utils/clientFetchFuntions";

interface Selectionist {
    id: string;
    nameTID?: string;
    name: Record<Language, string>;
    country: string;
    createdAt?: string;
    updatedAt?: string;
}

interface Props {
    open: boolean;
    selectionist: Selectionist | null;
    settings: {
        locale: Language;
    };
    onClose: () => void;
    onSuccess: () => void;
}

interface FormValues {
    nameTranslations: Partial<Record<Language, string>>;
    country: string;
}

export default function SelectionistModal({
    open,
    selectionist,
    settings,
    onClose,
    onSuccess
}: Props) {
    const t = getTFunc()

    const [form] = Form.useForm<FormValues>()

    const [loading, setLoading] = useState(false)
    const [aiLoading, setAiLoading] = useState(false)

    const [activeLanguage, setActiveLanguage]
        = useState<Language>(settings.locale)

    const originalTranslations = useRef<
        Partial<Record<Language, string>> | null
    >(null)
    const [nameTranslations, setNameTranslations] = useState({})

    const emptyTranslations = useMemo(
        () =>
            Object.values(Language).reduce(
                (acc, lang) => {
                    acc[lang] = ''
                    return acc
                },
                {} as Record<Language, string>
            ),
        []
    )

    useEffect(() => {
        if (!open) {
            return
        }

        setActiveLanguage(settings.locale)

        if (!selectionist) {
            originalTranslations.current = null

            form.resetFields()

            form.setFieldsValue({
                country: '',
                nameTranslations: emptyTranslations
            })

            return
        }

        originalTranslations.current = selectionist.name
        setNameTranslations(originalTranslations.current)

        form.setFieldsValue({
            country: selectionist.country,
            nameTranslations: selectionist.name
        })
    }, [
        open,
        selectionist,
        settings.locale,
        form,
        emptyTranslations
    ])

    const handleSubmit = async () => {
        try {
            const values
                = await form.validateFields()

            setLoading(true)

            const translationsChanged = JSON.stringify({
                ...nameTranslations,
                ...values.nameTranslations
            }) !== JSON.stringify(originalTranslations.current)

            const body: Record<string, unknown> = {
                country: values.country
            }

            if (selectionist?.id) {
                body.selectionistID = selectionist.id
            }

            if (selectionist?.nameTID && !translationsChanged) {
                body.nameTID
                    = selectionist.nameTID
            } else {
                body.nameTranslations = {
                    ...nameTranslations,
                    ...values.nameTranslations,
                    id: undefined
                }
            }

            const res = await fetch(
                '/api/admin/selectionists',
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type':
                            'application/json'
                    },
                    body: JSON.stringify(body)
                }
            )

            const data = await res.json()

            if (!res.ok) {
                if (data.message) {
                    message.error(data.message)
                } else if (data.messages) {
                    data.messages.forEach((item: string) =>
                        message.error(item))
                } else {
                    message.error(t('Failed to save selectionist'))
                }

                return
            }

            message.success(data.message || (selectionist ? t('Selectionist updated') : t('Selectionist created')))

            onSuccess()
        } catch {
            message.error(t('Failed to save selectionist'))
        } finally {
            setLoading(false)
        }
    }

    return (
        <Modal
            open={open}
            title={
                selectionist
                    ? t('Edit Selectionist')
                    : t('Create Selectionist')
            }
            onCancel={onClose}
            destroyOnHidden
            width={700}
            footer={[
                <Button
                    key="cancel"
                    onClick={onClose}
                >
                    {t('Cancel')}
                </Button>,

                <Button
                    key="ai"
                    onClick={() => generateAndFetchTranslations({
                        form,
                        activeLanguage,
                        fields: ['nameTranslations'],
                        t,
                        setAiLoading,
                        setLatestTranslations: [setNameTranslations]
                    })}
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
                    {selectionist
                        ? t('Update Selectionist')
                        : t('Create Selectionist')}
                </Button>
            ]}
        >
            <Form
                form={form}
                layout="vertical"
            >
                <Tabs
                    type="card"
                    activeKey={activeLanguage}
                    onChange={(key) =>
                        setActiveLanguage(key as Language)
                    }
                    items={Object.values(Language).map((lang) => ({
                        key: lang,
                        label:
                            lang.toUpperCase(),
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

                <Form.Item
                    name="country"
                    label={t('Country')}
                    rules={[
                        {
                            required: true,
                            message: t('Country is required')
                        }
                    ]}
                >
                    <Input />
                </Form.Item>
            </Form>
        </Modal>
    )
}