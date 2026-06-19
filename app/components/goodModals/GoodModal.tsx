'use client'

import { UploadOutlined, DeleteOutlined, ArrowLeftOutlined, ArrowRightOutlined } from '@ant-design/icons'
import {
    Button,
    Form,
    Input,
    message,
    Modal,
    Select,
    Tabs,
    Upload,
    Space,
    InputNumber,
    Divider,
    Image
} from 'antd'
import { useEffect, useState } from 'react'

import { commonFetch, generateAndFetchTranslations } from '@/app/utils/clientFetchFuntions'
import { Language } from '@/app/utils/enums'
import { extractS3Key, getTFunc } from '@/app/utils/helpers'

interface Props {
    open: boolean
    goodID: string | null
    settings: { locale: Language }
    onClose: () => void
    onSuccess: () => void
}

export default function GoodModal({
    open,
    goodID,
    settings,
    onClose,
    onSuccess
}: Props) {
    const t = getTFunc()
    const [form] = Form.useForm()

    const [loading, setLoading] = useState(false)
    const [aiLoading, setAiLoading] = useState(false)
    const [activeLang, setActiveLang] = useState<Language>(settings?.locale)

    const [selectionistRes, setSelectionistRes] = useState<{ selectionists: any[]}>({ selectionists: [] })
    const [tagRes, setTagRes] = useState<{ tags: any[]}>({ tags: [] })
    const [itemTypeRes, setItemTypeRes] = useState<{ itemTypes: any[]}>({ itemTypes: [] })
    const [categoryRes, setCategoryRes] = useState<{ categories: any[]}>({ categories: [] })

    const [nameTranslations, setNameTranslations] = useState<Record<Language, string> | null>(null)
    const [descriptionTranslations, setDescriptionTranslations] = useState<Record<Language, string> | null>(null)

    const [good, setGood] = useState<any | null>(null)

    // ---------------- LOAD OPTIONS ----------------
    useEffect(() => {
        if (!open) {return}

        const load = async () => {
            await Promise.all([
                commonFetch({
                    type: 'categories',
                    setData: setCategoryRes
                }),
                commonFetch({
                    type: 'selectionists',
                    setData: setSelectionistRes
                }),
                commonFetch({
                    type: 'adminTags',
                    setData: setTagRes
                }),
                commonFetch({
                    type: 'adminItemTypes',
                    setData: setItemTypeRes
                })
            ])
        }

        load()
    }, [open])

    // ---------------- INIT FORM ----------------
    useEffect(() => {
        if (!open) {
            return
        }

        const load = async () => {
            if (!goodID) {
                form.resetFields()
                return
            }

            const res = await fetch(`/api/goods/${goodID}`)
            const data = await res.json()

            if (!res.ok) {
                message.error(data?.message || t('Failed to load product'))
                return
            }

            setGood(data.good) // ONLY here
        }

        load()
    }, [open, goodID])

    useEffect(() => {
        if (!good) {
            return
        }
        form.setFieldsValue({
            categoryID: good.categoryID,
            selectionistID: {
                value: good.selectionist?.id,
                label: good.selectionist?.name?.[settings.locale]
            },
            tagIDs: good.tags?.map((t: any) => ({
                value: t.id,
                label: t.name?.[settings.locale]
            })),
            nameTranslations: good.name,
            descriptionTranslations: good.description,
            photos: good.photos?.map((p: string) => ({
                uid: p,
                url: p,
                s3Key: extractS3Key(p)
            })),
            pricings: good.pricings?.map((p: any) => ({
                key: p.id,
                pricingID: p.id,
                itemTypeID: p.itemType?.id,
                price: p.price,
                quantity: p.quantity
            })) ?? []
        })

        setNameTranslations(good.name)
        setDescriptionTranslations(good.description)
    }, [good])

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields()

            setLoading(true)

            const isEdit = !!good?.id

            const body: any = {
                ...values,
                photos: values.photos.map((item: any) => item.s3Key),
                selectionistID: isEdit ? values.selectionistID.value : values.selectionistID,
                tagIDs: isEdit ? values.tagIDs.map((item: any) => item.value) : values.tagIDs,
                nameTranslations: {
                    ...nameTranslations,
                    ...values.nameTranslations,
                    id: undefined
                },
                descriptionTranslations: {
                    ...descriptionTranslations,
                    ...values.descriptionTranslations,
                    id: undefined
                }
            }

            const res = await fetch(
                isEdit
                    ? `/api/admin/goods/${good.id}`
                    : '/api/admin/goods',
                {
                    method: isEdit ? 'PATCH' : 'POST',
                    headers: { 'Content-Type': 'application/json' },
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
                    message.error(data?.message || t('Failed to save product'))
                }

                return
            }

            message.success(data.message || t('Saved'))
            onSuccess()
        } catch {
            message.error(t('Operation failed'))
        } finally {
            setLoading(false)
        }
    }

    return (
        <Modal
            open={open}
            onCancel={onClose}
            width={1000}
            destroyOnHidden
            title={good ? t('Edit Good') : t('Create Good')}
            onOk={handleSubmit}
            confirmLoading={loading}
            footer={[
                <Button key="cancel" onClick={onClose}>
                    {t('Cancel')}
                </Button>,

                <Button
                    key="ai"
                    loading={aiLoading}
                    onClick={() => generateAndFetchTranslations({
                        form,
                        activeLanguage: activeLang,
                        fields: ['nameTranslations', 'descriptionTranslations'],
                        t,
                        setAiLoading,
                        setLatestTranslations: [setNameTranslations, setDescriptionTranslations]
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
                    {good
                        ? t('Update Product')
                        : t('Create Product')}
                </Button>
            ]}
        >
            <Form form={form} layout="vertical">

                {/* ---------------- MAIN INFO ---------------- */}
                <Divider>Main</Divider>

                <Form.Item name="categoryID" label={t('Category')}>
                    <Select
                        options={categoryRes?.categories?.map((category: any) => ({
                            value: category.id,
                            label: category.name?.[settings.locale]
                        }))}
                        placeholder={t('Category')}
                    />
                </Form.Item>

                <Form.Item name="selectionistID" label={t('Selectionist')}>
                    <Select
                        showSearch={{
                            onSearch: (val) => commonFetch({
                                type: 'selectionists',
                                setData: setSelectionistRes,
                                search: val
                            }),
                            filterOption: false
                        }}
                        options={selectionistRes?.selectionists?.map((selectionist) => ({
                            value: selectionist.id,
                            label: selectionist.name?.[settings.locale]
                        }))}
                    />
                </Form.Item>

                <Form.Item name="tagIDs" label={t('Tags')}>
                    <Select
                        showSearch={{
                            onSearch: (val) => commonFetch({
                                type: 'adminTags',
                                setData: setTagRes,
                                search: val
                            }),
                            filterOption: false
                        }}
                        mode="multiple"
                        options={tagRes?.tags?.map((tag) => ({
                            value: tag.id,
                            label: tag.name?.[settings.locale]
                        }))}
                    />
                </Form.Item>

                {/* ---------------- TRANSLATIONS ---------------- */}
                <Tabs
                    type="card"
                    activeKey={activeLang}
                    onChange={(k) => setActiveLang(k as Language)}
                    items={Object.values(Language).map((lang) => ({
                        key: lang,
                        label: lang.toUpperCase(),
                        children: (
                            <>
                                <Form.Item
                                    name={['nameTranslations', lang]}
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
                                    name={['descriptionTranslations', lang]}
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
                            </>
                        )
                    }))}
                />

                {/* ---------------- PHOTOS ---------------- */}
                <Divider>Photos</Divider>

                <Form.Item
                    name="photos"
                    valuePropName="fileList"
                    getValueFromEvent={(e) => e?.fileList}
                >
                    <Upload
                        showUploadList={false}
                        multiple
                        customRequest={async ({ file, onSuccess, onError }) => {
                            try {
                                const formData = new FormData()
                                formData.append('files', file as File)

                                const res = await fetch('/api/files/upload', {
                                    method: 'POST',
                                    body: formData
                                })

                                const data = await res.json()

                                const uploaded = data.files?.[0]

                                if (!uploaded) {
                                    throw new Error(t('Upload failed'))
                                }

                                // IMPORTANT: mark success with S3 key
                                onSuccess?.(uploaded, file as any)
                            } catch (err) {
                                onError?.(err as any)
                            }
                        }}
                        onChange={(info) => {
                            const fileList = info.fileList?.map((file) => {
                                const uploaded = file.response

                                return {
                                    uid: file.uid,                // React-safe unique
                                    stableId: file.uid,          // ALWAYS use this for UI keys
                                    url: uploaded?.publicUrl || file.url,
                                    s3Key: extractS3Key(uploaded?.publicUrl) || extractS3Key(file.url),
                                    response: uploaded
                                }
                            })

                            form.setFieldsValue({ photos: fileList })
                        }}
                    >
                        <Button icon={<UploadOutlined />}>
                            Upload
                        </Button>
                    </Upload>
                </Form.Item>

                <Form.Item shouldUpdate>
                    {() => {
                        const photos = form.getFieldValue('photos') || []

                        const move = (key: string, dir: -1 | 1) => {
                            const list = [...photos]

                            const index = list.findIndex((p: any) => p.uid === key)
                            if (index === -1) {
                                return
                            }

                            const newIndex = index + dir
                            if (newIndex < 0 || newIndex >= list.length) {
                                return
                            }

                            const updated = [...list]
                            ;[updated[index], updated[newIndex]] = [updated[newIndex], updated[index]]

                            form.setFieldsValue({ photos: updated })
                        }

                        const remove = (key: string) => {
                            form.setFieldsValue({
                                photos: photos.filter((p: any) => p.uid !== key)
                            })
                        }

                        return (
                            <div className="flex flex-wrap gap-2">
                                {photos.map((p: any) => {
                                    const stableKey = p.key || p.uid

                                    return (
                                        <div key={stableKey} className="relative">
                                            <Image
                                                src={p.url || p.thumbUrl}
                                                width={200}
                                                height={200}
                                                style={{ objectFit: 'cover' }}
                                            />

                                            <Space
                                                orientation="vertical"
                                                size={2}
                                                className="absolute top-0 right-0"
                                            >
                                                <Button onClick={() => move(stableKey, -1)} size="small">
                                                    <ArrowLeftOutlined />
                                                </Button>

                                                <Button onClick={() => move(stableKey, 1)} size="small">
                                                    <ArrowRightOutlined />
                                                </Button>

                                                <Button onClick={() => remove(stableKey)} danger size="small">
                                                    <DeleteOutlined />
                                                </Button>
                                            </Space>
                                        </div>
                                    )
                                })}
                            </div>
                        )
                    }}
                </Form.Item>

                <Divider>Pricings</Divider>

                <Form.List name="pricings">
                    {(fields, { add, remove }) => (
                        <>
                            {fields.map((field) => {
                                const { key, ...restField } = field

                                return (
                                    <Space key={key} style={{ display: 'flex' }} align="baseline">
                                        <Form.Item
                                            {...restField}
                                            name={[field.name, 'pricingID']}
                                            hidden
                                        >
                                            <Input />
                                        </Form.Item>

                                        <Form.Item
                                            {...restField}
                                            label={t('Product Type')}
                                            name={[field.name, 'itemTypeID']}
                                        >
                                            <Select
                                                style={{ width: 180 }}
                                                options={itemTypeRes?.itemTypes?.map((itemType) => ({
                                                    value: itemType.id,
                                                    label: itemType.name?.[settings.locale]
                                                }))}
                                            />
                                        </Form.Item>

                                        <Form.Item
                                            {...restField}
                                            label={t('Price')}
                                            name={[field.name, 'price']}
                                        >
                                            <InputNumber min={0} />
                                        </Form.Item>

                                        <Form.Item
                                            {...restField}
                                            label={t('Quantity')}
                                            name={[field.name, 'quantity']}
                                        >
                                            <InputNumber min={0} />
                                        </Form.Item>

                                        <Button danger onClick={() => remove(field.name)}>
                                            <DeleteOutlined />
                                        </Button>
                                    </Space>
                                )
                            })}

                            <Button onClick={() => add()} type="dashed" block>
                                + Add pricing
                            </Button>
                        </>
                    )}
                </Form.List>

            </Form>
        </Modal>
    )
}