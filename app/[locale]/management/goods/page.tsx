'use client'

import { Tabs } from 'antd';
import GoodTab from "@/app/components/goodTabs/GoodTab";
import CategoryTab from "@/app/components/goodTabs/CategoryTab";
import ItemTypeTab from "@/app/components/goodTabs/ItemTypeTab";
import TagTab from "@/app/components/goodTabs/TagTab";
import SelectionistTab from "@/app/components/goodTabs/SelectionistTab";
import {fetchSettings, useT} from "@/app/utils/helpers";
import {useEffect, useState} from "react";
import {usePathname} from "next/navigation";



export default function GoodsPage() {
    const t = useT()
    const [settings, setSettings] = useState<any>(null)
    const pathname = usePathname();
    const [, locale, ...rest] = pathname.split('/');


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
            children: <GoodTab />,
        },
        {
            key: 'categories',
            label: t('Categories'),
            children: <CategoryTab />,
        },
        {
            key: 'tags',
            label: t('Tags'),
            children: <TagTab />,
        },
        {
            key: 'item-types',
            label: t('Product Types'),
            children: <ItemTypeTab settings={settings}/>,
        },
        {
            key: 'selectionists',
            label: t('Selectionists'),
            children: <SelectionistTab />,
        },
    ];

    return <Tabs defaultActiveKey="goods" items={items} />;
}