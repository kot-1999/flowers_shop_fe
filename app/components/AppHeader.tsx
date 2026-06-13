'use client';

import {useEffect, useState} from 'react';
import {Button, Drawer, Flex, Menu, Select} from 'antd';
import {
    MenuOutlined,
} from '@ant-design/icons';
import Link from 'next/link';

import { Header } from 'antd/es/layout/layout';
import { usePathname, useRouter } from 'next/navigation';

import { useAuth } from '@/app/components/AuthContent';
import {fetchSettings, languageOptions, removeLocalStorage, useT} from '@/app/utils/helpers';
import {Language, LocalStorageKey} from '@/app/utils/enums';
import {getMenuItems} from "@/app/utils/menuItems";

export default function AppHeader() {
    const { user } = useAuth();
    const t = useT();
    const router = useRouter();

    const pathname = usePathname();
    const [drawerOpen, setDrawerOpen] = useState(false);

    const currentLocale = pathname.split('/')[1] as Language;

    const [settings, setSettings] = useState<any>(null)
    const items = getMenuItems({ user, settings, setDrawerOpen });
    const [, locale, ...rest] = pathname.split('/');

    // Load application settings
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
    }, [])

    async function changeLanguage(nextLocale: Language) {
        await fetch('/api/cookie/settings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                locale: nextLocale,
            }),
        });

        const newPath = pathname.replace(
            `/${currentLocale}`,
            `/${nextLocale}`
        );

        router.push(newPath);
    }
    return (
        <>
            {/* HEADER */}
            <Header
                style={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 1100, // above page content
                    boxShadow: drawerOpen
                        ? 'none'
                        : '0 2px 8px rgba(0, 0, 0, 0.15)', // 👈 restore shadow
                    transition: 'box-shadow 0.2s ease',
                }}
            >
                <Flex
                    justify="space-between"
                    align="center"
                    style={{ width: '100%', height: '100%' }}
                >
                    <Link
                        href="/"
                        className="text-white text-xl font-semibold no-underline"
                        onClick={() => {
                            removeLocalStorage(LocalStorageKey.SelectedCategory);
                            removeLocalStorage(LocalStorageKey.SearchSettings);
                            removeLocalStorage(LocalStorageKey.HomePagination);
                        }}
                    >
                        🌸 Flowers Shop
                    </Link>

                    <Flex align="center" gap={10}>
                        <Select
                            value={currentLocale}
                            style={{ width: 140 }}
                            popupStyle={{ zIndex: 1110 }}
                            onChange={changeLanguage}
                            options={languageOptions}
                        />

                        <Button
                            type="text"
                            icon={<MenuOutlined />}
                            onClick={() => setDrawerOpen(true)}
                            className="text-white text-lg"
                        />
                    </Flex>
                </Flex>
            </Header>

            {/* DRAWER */}
            <Drawer
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                placement="right"
                width={340}
                zIndex={1200}
                styles={{
                    body: {
                        padding: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        height: '100%',
                    },
                }}
                title={t('Menu')}
            >
                <Menu
                    mode="inline"
                    selectedKeys={['/' + rest.join('/')]}
                    defaultOpenKeys={['categories', 'account']}
                    style={{
                        borderInlineEnd: 0,
                        flex: 1,
                        overflowY: 'auto',
                    }}
                    items={items}
                />

                <div style={{ padding: 12  }}>
                    <Button
                        type="primary"
                        block
                        onClick={() => setDrawerOpen(false)}
                        style={{ borderRadius: 10 }}
                    >
                        {t('Hide menu')}
                    </Button>
                </div>
            </Drawer>
        </>
    );
}