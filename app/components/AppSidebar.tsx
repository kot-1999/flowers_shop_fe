'use client';

import { useState } from 'react';
import { Layout, Menu, Button, Select } from 'antd';
import { usePathname, useRouter } from 'next/navigation';

import { useAuth } from '@/app/components/AuthContent';
import {languageOptions, useT} from '@/app/utils/helpers';
import { Language } from '@/app/utils/enums';
import { getMenuItems } from '@/app/utils/menuItems';
import Link from "next/link";

const { Sider } = Layout;

export default function AppSidebar() {
    const { user } = useAuth();
    const t = useT();
    const router = useRouter();
    const pathname = usePathname();

    const currentLocale = pathname.split('/')[1] as Language;
    const [collapsed, setCollapsed] = useState(false);

    async function changeLanguage(nextLocale: Language) {
        await fetch('/api/cookie/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ locale: nextLocale }),
        });

        const newPath = pathname.replace(`/${currentLocale}`, `/${nextLocale}`);
        router.push(newPath);
    }

    const items = getMenuItems({ user, t });

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
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            <div
                style={{
                    height: 64,
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 16px',
                }}
            >
                <Link
                    href="/"
                    className="text-white text-xl font-semibold no-underline"
                >
                    🌸 {!collapsed ? ' Flowers Shop' : ''}
                </Link>
            </div>
            {/* MENU (takes all space) */}
            <Menu
                mode="inline"
                selectedKeys={[pathname]}
                defaultOpenKeys={['categories', 'account']}
                style={{
                    flex: 1,
                    borderRight: 0,
                }}
                items={items}
            />

            {/* BOTTOM SECTION (language + button) */}
            <div style={{ padding: 12, marginTop: 'auto' }}>
                <Select
                    value={currentLocale}
                    style={{ width: '100%', marginBottom: 8 }}
                    onChange={changeLanguage}
                    options={languageOptions}
                />
            </div>
        </Sider>
    );
}