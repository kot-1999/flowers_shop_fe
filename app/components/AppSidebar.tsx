'use client';

import {useEffect, useState} from 'react';
import {Layout, Menu, Button, Select, Space, Switch, Typography} from 'antd';
import { usePathname, useRouter } from 'next/navigation';

import { useAuth } from '@/app/components/AuthContent';
import {fetchSettings, getLocalStorage, languageOptions, removeLocalStorage, useT} from '@/app/utils/helpers';
import {Language, LocalStorageKey} from '@/app/utils/enums';
import { getMenuItems } from '@/app/utils/menuItems';
import Link from "next/link";
import {MoonOutlined, SunOutlined} from "@ant-design/icons";

const { Text } = Typography;

const { Sider } = Layout;

export default function AppSidebar({ isDark, setDark }: { isDark: boolean, setDark: (val: boolean) => void }) {
    const { user } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    const currentLocale = pathname.split('/')[1] as Language;
    const [collapsed, setCollapsed] = useState(false);
    const [settings, setSettings] = useState<any>(null)

    const items = getMenuItems({ user, settings });

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
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ locale: nextLocale }),
        });

        const newPath = pathname.replace(`/${currentLocale}`, `/${nextLocale}`);
        router.push(newPath);
    }


    return (
        <Sider
            collapsible
            collapsed={collapsed}
            onCollapse={setCollapsed}
            width={260}
            style={{
                height: '100vh',
                position: 'sticky',
                top: 0,
                left: 0,
            }}
        >
            {/* IMPORTANT: internal flex container */}
            <div
                style={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                }}
            >
                {/* HEADER (fixed) */}
                <div
                    style={{
                        height: 64,
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0 16px',
                        flexShrink: 0,
                    }}
                >
                    <Link
                        href={`/`}
                        className="text-white text-xl font-semibold no-underline"
                        onClick={() => {
                            removeLocalStorage(LocalStorageKey.SelectedCategory);
                            removeLocalStorage(LocalStorageKey.SearchSettings);
                            removeLocalStorage(LocalStorageKey.HomePagination);
                        }}
                    >
                        🌸 {!collapsed ? ' Flowers Shop' : ''}
                    </Link>
                </div>

                {/* SCROLLABLE MENU AREA */}
                <div
                    style={{
                        flex: 1,
                        overflowY: 'auto',
                    }}
                >
                    <Menu
                        mode="inline"
                        selectedKeys={['/' + rest.join('/')]}
                        defaultOpenKeys={['categories', 'account']}
                        style={{
                            borderRight: 0,
                        }}
                        items={items}
                    />
                </div>

                {/* BOTTOM SECTION (fixed) */}
                <div style={{ padding: 12, flexShrink: 0 }}>
                    {isDark ? <MoonOutlined /> : <SunOutlined />}

                    <Switch
                        checked={isDark}
                        onChange={(checked) => setDark(checked)}
                        checkedChildren="Dark"
                        unCheckedChildren="Light"
                    />

                    <Text type="secondary">
                        {isDark ? "Dark mode" : "Light mode"}
                    </Text>
                    <Select
                        value={currentLocale}
                        style={{ width: '100%', marginBottom: 8 }}
                        onChange={changeLanguage}
                        options={languageOptions}
                    />
                </div>
            </div>
        </Sider>
    );
}