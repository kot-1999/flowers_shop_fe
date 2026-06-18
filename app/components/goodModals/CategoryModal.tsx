'use client'

import { UploadOutlined } from '@ant-design/icons'
import { Button, Form, Input, message, Modal, Tabs, Upload } from 'antd'
import { useEffect, useMemo, useRef, useState } from 'react'

import { generateAndFetchTranslations } from '@/app/utils/clientFetchFuntions'
import { Language } from '@/app/utils/enums'
import { extractS3Key, getTFunc } from '@/app/utils/helpers'

interface Category {
    id: string
    nameTID?: string
    descriptionTID?: string
    name: Record<Language, string>
    description: Record<Language, string>
    coverImage?: string | null
    createdAt?: string
    updatedAt?: string
}

interface Props {
    open: boolean
    category: Category | null
    settings: { locale: Language }
    onClose: () => void
    onSuccess: () => void
}

interface FormValues {
    nameTranslations: Record<Language, string>
    descriptionTranslations: Record<Language, string>
    coverImage?: any
}

export default function CategoryModal({
    open,
    category,
    settings,
    onClose,
    onSuccess
}: Props) {
    const t = getTFunc()
    const [form] = Form.useForm<FormValues>()

    const [loading, setLoading] = useState(false)
    const [aiLoading, setAiLoading] = useState(false)

    const [activeLanguage, setActiveLanguage] = useState<Language>(settings.locale)

    const originalName = useRef<Record<Language, string> | null>(null)
    const originalDescription = useRef<Record<Language, string> | null>(null)

    const [latestName, setLatestName] = useState<Record<Language, string> | null>(null)
    const [latestDescription, setLatestDescription] = useState<Record<Language, string> | null>(null)
    
    const emptyTranslations = useMemo(() => {
        return Object.values(Language).reduce((acc, lang) => {
            acc[lang] = ''
            return acc
        }, {} as Record<Language, string>)
    }, [])

    useEffect(() => {
        if (!open) {
            return
        }

        setActiveLanguage(settings.locale)

        if (!category) {
            originalName.current = null
            originalDescription.current = null

            form.resetFields()
            form.setFieldsValue({
                nameTranslations: emptyTranslations,
                descriptionTranslations: emptyTranslations,
                coverImage: ''
            })

            return
        }

        originalName.current = category.name
        originalDescription.current = category.description

        setLatestName(originalName.current)
        setLatestDescription(originalDescription.current)
        
        form.setFieldsValue({
            nameTranslations: category.name,
            descriptionTranslations: category.description,
            coverImage: category.coverImage
                ? [
                    {
                        uid: '-1',
                        name: 'cover',
                        status: 'done',
                        url: category.coverImage
                    }
                ]
                : []
        })
    }, [open, category, settings.locale, form, emptyTranslations])

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields()
            setLoading(true)

            const nameChanged
                = JSON.stringify({
                    ...latestName,
                    ...values.nameTranslations
                })
                !== JSON.stringify(originalName.current)

            const descChanged
                = JSON.stringify({
                    ...latestDescription,
                    ...values.descriptionTranslations
                })
                !== JSON.stringify(originalDescription.current)

            // File upload
            let coverImage: string | undefined | null
            const file = values.coverImage?.[0]?.originFileObj

            if (file) {
                const formData = new FormData()
                formData.append('files', file)

                const res = await fetch('/api/files/upload', {
                    method: 'POST',
                    body: formData
                })

                const data = await res.json()

                coverImage = data.files?.[0]?.key
            } else if (values.coverImage?.length === 0) {
                // user explicitly removed image
                coverImage = null
            } else {
                coverImage = extractS3Key(category?.coverImage)
            }

            // Fields update
            const body: Record<string, unknown> = {
                coverImage
            }

            if (category?.id) {
                body.categoryID = category.id
            }

            if (category?.nameTID && !nameChanged) {
                body.nameTID = category.nameTID
            } else {
                body.nameTranslations = {
                    ...latestName,
                    ...values.nameTranslations,
                    id: undefined
                }
            }

            if (category?.descriptionTID && !descChanged) {
                body.descriptionTID = category.descriptionTID
            } else {
                body.descriptionTranslations = {
                    ...latestDescription,
                    ...values.descriptionTranslations,
                    id: undefined
                }
            }

            const res = await fetch('/api/admin/categories', {
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
                    message.error(data?.message || t('Failed to save category'))
                }

                return
            }

            message.success(data?.message || (category ? t('Category updated') : t('Category created')))

            onSuccess()
        } catch {
            message.error(t('Failed to save category'))
        } finally {
            setLoading(false)
        }
    }

    return (
        <Modal
            open={open}
            onCancel={onClose}
            destroyOnHidden
            width={750}
            title={
                category ? t('Edit Category') : t('Create Category')
            }
            footer={[
                <Button key="cancel" onClick={onClose}>
                    {t('Cancel')}
                </Button>,

                <Button
                    key="ai"
                    loading={aiLoading}
                    onClick={() => generateAndFetchTranslations({
                        form,
                        activeLanguage,
                        fields: ['nameTranslations', 'descriptionTranslations'],
                        t,
                        setAiLoading
                    })}
                >
                    {t('Generate translations')}
                </Button>,

                <Button
                    key="submit"
                    type="primary"
                    loading={loading}
                    onClick={handleSubmit}
                >
                    {category
                        ? t('Update Category')
                        : t('Create Category')}
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
                            <>
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

                                <Form.Item
                                    name={[
                                        'descriptionTranslations',
                                        lang
                                    ]}
                                    label={t('Description')}
                                    rules={[
                                        {
                                            required: true,
                                            message: t('Description is required')
                                        }
                                    ]}
                                >
                                    <Input.TextArea rows={3} />
                                </Form.Item>

                                <Form.Item
                                    name="coverImage"
                                    label={t('Cover Image')}
                                    valuePropName="fileList"
                                    getValueFromEvent={(e) =>
                                        Array.isArray(e) ? e : e?.fileList
                                    }
                                >
                                    <Upload
                                        maxCount={1}
                                        beforeUpload={() => false}
                                        listType="picture"
                                    >
                                        <Button icon={<UploadOutlined />}>
                                            {t('Upload')}
                                        </Button>
                                    </Upload>
                                </Form.Item>
                            </>
                        )
                    }))}
                />
            </Form>
        </Modal>
    )
}