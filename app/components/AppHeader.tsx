'use client';

import {useEffect, useState} from 'react';
import {Button, Drawer, Flex, Menu, Select} from 'antd';
import {
    AppstoreOutlined,
    MenuOutlined,
    ShoppingCartOutlined,
    ShoppingOutlined,
    UserOutlined
} from '@ant-design/icons';
import Link from 'next/link';

import { Header } from 'antd/es/layout/layout';
import { usePathname, useRouter } from 'next/navigation';

import { useAuth } from '@/app/components/AuthContent';
import {languageOptions, useT} from '@/app/utils/helpers';
import { Language } from '@/app/utils/enums';
import {getMenuItems} from "@/app/utils/menuItems";

export default function AppHeader() {
    const { user } = useAuth();
    const t = useT();
    const router = useRouter();

    const pathname = usePathname();
    const [drawerOpen, setDrawerOpen] = useState(false);

    const currentLocale = pathname.split('/')[1] as Language;

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
    const items = getMenuItems({ user, t, setDrawerOpen });
    return (
        <>
            <Header style={{
                position: 'sticky',
                top: 0,
                zIndex: 9999,
            }}>
                <Flex
                    justify="space-between"
                    align="center"
                    style={{
                        width: '100%',
                        height: '100%',
                    }}
                >
                    {/* Logo */}
                    <Link
                        href="/"
                        className="text-white text-xl font-semibold no-underline"
                    >
                        🌸 Flowers Shop
                    </Link>


                    {/* RIGHT SIDE */}
                    <Flex align="center" gap={10}>
                        <Select
                            value={currentLocale}
                            style={{ width: 140 }}
                            onChange={changeLanguage}
                            options={languageOptions}
                        />

                        {/* MOBILE MENU BUTTON */}
                        <Button
                            type="text"
                            icon={<MenuOutlined />}
                            onClick={() => setDrawerOpen(true)}
                            className="text-white text-lg"
                        />
                    </Flex>
                </Flex>
            </Header>

            {/* MOBILE DRAWER */}
            <Drawer
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                placement="right"
                width={340}
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
                    selectedKeys={[pathname]}
                    defaultOpenKeys={['categories', 'account']}
                    style={{
                        borderInlineEnd: 0,
                        flex: 1,
                        overflowY: 'auto',
                    }}
                    items={items}
                />

                <div style={{ padding: 12 }}>
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