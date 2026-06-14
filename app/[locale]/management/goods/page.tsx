'use client'

import { Tabs } from 'antd'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

import CategoryTab from '@/app/components/goodTabs/CategoryTab'
import GoodTab from '@/app/components/goodTabs/GoodTab'
import ItemTypeTab from '@/app/components/goodTabs/ItemTypeTab'
import SelectionistTab from '@/app/components/goodTabs/SelectionistTab'
import TagTab from '@/app/components/goodTabs/TagTab'
import { fetchSettings, getTFunc } from '@/app/utils/helpers'

export default function GoodsPage() {
    const t = getTFunc()
    const [settings, setSettings] = useState<any>(null)
    const pathname = usePathname()
    const [, locale] = pathname.split('/')

    useEffect(() => {
        const loadSettings = async () => {
            try {
                const data = await fetchSettings()
                setSettings(data)
            } catch (error) {
                console.error(error)
            }
        }

        loadSettings()
    }, [locale])

    const items = [
        {
            key: 'goods',
            label: t('Goods'),
            children: <GoodTab />
        },
        {
            key: 'categories',
            label: t('Categories'),
            children: <CategoryTab />
        },
        {
            key: 'tags',
            label: t('Tags'),
            children: <TagTab settings={settings}/>
        },
        {
            key: 'item-types',
            label: t('Product Types'),
            children: <ItemTypeTab settings={settings}/>
        },
        {
            key: 'selectionists',
            label: t('Selectionists'),
            children: <SelectionistTab settings={settings}/>
        }
    ]

    return <Tabs defaultActiveKey="goods" items={items} />
}