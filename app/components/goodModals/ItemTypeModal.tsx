import { useEffect, useMemo, useRef, useState } from 'react';
import {
    Button,
    Form,
    Input,
    InputNumber,
    message,
    Modal,
    Tabs,
} from 'antd';

import { Language } from '@/app/utils/enums';
import { useT } from '@/app/utils/helpers';

type ItemType = {
    id: string;
    nameTID?: string;
    name: Record<Language, string>;
    weight: number;
    createdAt?: string;
    updatedAt?: string;
};

type Props = {
    open: boolean;
    itemType: ItemType | null;
    settings: {
        locale: Language;
    };
    onClose: () => void;
    onSuccess: () => void;
};

type FormValues = {
    nameTranslations: Partial<Record<Language, string>>;
    weight: number;
};

export default function ItemTypeModal({
    open,
    itemType,
    settings,
    onClose,
    onSuccess,
}: Props) {
    const t = useT();

    const [form] = Form.useForm<FormValues>();

    const [aiLoading, setAiLoading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [activeLanguage, setActiveLanguage] = useState<Language>(
        settings.locale
    );

    const originalTranslations = useRef<
        Partial<Record<Language, string>> | null
    >(null);

    const emptyTranslations = useMemo(
        () =>
            Object.values(Language).reduce(
                (acc, lang) => {
                    acc[lang] = '';
                    return acc;
                },
                {} as Record<Language, string>
            ),
        []
    );

    useEffect(() => {
        if (!open) {
            return;
        }

        setActiveLanguage(settings.locale);

        if (!itemType) {
            originalTranslations.current = null;

            form.resetFields();

            form.setFieldsValue({
                weight: 1,
                nameTranslations: emptyTranslations,
            });

            return;
        }

        originalTranslations.current = itemType.name;

        form.setFieldsValue({
            weight: itemType.weight,
            nameTranslations: itemType.name,
        });
    }, [
        open,
        itemType,
        settings.locale,
        form,
        emptyTranslations,
    ]);

    const generateTranslations = async () => {
        try {
            const values = form.getFieldsValue();
            const sourceText =
                values?.nameTranslations?.[activeLanguage];

            if (!sourceText) {
                message.warning(t('Enter text first'));
                return;
            }

            setAiLoading(true);

            const res = await fetch('/api/ai/translations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: [sourceText],
                }),
            });

            const data = await res.json();
            console.log('!!!!!!!!', data)

            if (!res.ok) {
                message.error(
                    data?.message || t('AI translation failed')
                );
                return;
            }

            const translations = data?.translations?.[0];
            if (!translations) return;

            const current = form.getFieldValue('nameTranslations') || {};

            form.setFieldsValue({
                nameTranslations: {
                    ...current,
                    ...translations,
                },
            });

            message.success(t('Translations generated'));
        } catch (e) {
            message.error(t('AI translation failed'));
        } finally {
            setAiLoading(false);
        }
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();

            setLoading(true);

            const translationsChanged =
                JSON.stringify(values.nameTranslations) !==
                JSON.stringify(originalTranslations.current);

            const body: Record<string, unknown> = {
                weight: values.weight,
            };

            if (itemType?.id) {
                body.itemTypeID = itemType.id;
            }

            if (
                itemType?.nameTID &&
                !translationsChanged
            ) {
                body.nameTID = itemType.nameTID;
            } else {
                body.nameTranslations = values.nameTranslations;
            }

            const res = await fetch('/api/admin/item-types', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });

            const data = await res.json();

            if (!res.ok) {
                if (data.message) {
                    message.error(data.message);
                } else if (data.messages) {
                    data.messages.forEach((item: string) =>
                        message.error(item)
                    );
                } else {
                    message.error(t('Failed to save item type'));
                }

                return;
            }

            message.success(
                data.message ||
                (itemType
                    ? t('Item type updated')
                    : t('Item type created'))
            );

            onSuccess();
        } catch (error) {
            message.error(t('Failed to save item type'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            open={open}
            title={
                itemType
                    ? t('Edit Item Type')
                    : t('Create Item Type')
            }
            onCancel={onClose}
            destroyOnHidden
            confirmLoading={loading}
            footer={[
                <Button
                    key="cancel"
                    onClick={onClose}
                >
                    {t('Cancel')}
                </Button>,

                <Button
                    onClick={generateTranslations}
                    loading={aiLoading}
                    style={{ marginBottom: 12 }}
                >
                    {t('Generate translations')}
                </Button>,

                <Button
                    key="submit"
                    type="primary"
                    loading={loading}
                    onClick={handleSubmit}
                >
                    {itemType
                        ? t('Update Item Type')
                        : t('Create Item Type')}
                </Button>,
            ]}
            width={700}
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
                        label: lang.toUpperCase(),
                        children: (
                            <Form.Item
                                name={[
                                    'nameTranslations',
                                    lang,
                                ]}
                                label={t('Name')}
                                rules={[
                                    {
                                        required: true,
                                        message: t(
                                            'Name is required'
                                        ),
                                    },
                                ]}
                            >
                                <Input />
                            </Form.Item>
                        ),
                    }))}
                />

                <Form.Item
                    name="weight"
                    label={t('Weight')}
                    rules={[
                        {
                            required: true,
                            message: t(
                                'Weight is required'
                            ),
                        },
                    ]}
                >
                    <InputNumber
                        min={1}
                        style={{ width: '100%' }}
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
}