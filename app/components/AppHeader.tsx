'use client'

import {Flex, Menu, Select} from "antd";
import Link from "next/link";

import {Header} from "antd/es/layout/layout";
import {usePathname, useRouter} from "next/navigation";
import {useAuth} from "@/app/components/AuthContent";
import {useT} from "@/app/utils/helpers";
import {Language} from "@/app/utils/enums";

export default function AppHeader() {
    const { user, checkAuth } = useAuth();
    const t = useT()
    const router = useRouter();

    const pathname = usePathname();
    // Proxy makes sure that it always gonna be Language
    const currentLocale = pathname.split('/')[1] as Language;


    async function changeLanguage(nextLocale: Language) {
        await fetch('/api/cookie/settings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                locale: nextLocale,
            })
        });
        const newPath = pathname.replace(`/${currentLocale}`, `/${nextLocale}`);
        router.push(newPath);

    }

    return (
        <Header>
            <Flex justify="space-between" align="center">
            <Menu
                theme="dark"
                mode="horizontal"
                selectedKeys={[pathname]}
                items={[
                    { key: "/", label: <Link href="/">/:{t('Home')}</Link> },
                    { key: "/about", label: <Link href="/about">{t('About')}</Link> },
                    { key: "/login", label: <Link href="/auth/login">{t('Login')}</Link> },
                    user ? { key: "/pages/profile", label: <Link href="/profile">{t('Profile')}</Link> } : null
                ]}
            />
            <Select
                value={currentLocale}
                style={{ width: 140, marginLeft: 16 }}
                onChange={changeLanguage}
                options={[
                    { value: Language.en, label: "English" },
                    { value: Language.ua, label: "Українська" },
                    { value: Language.de, label: "Deutsch" },
                    { value: Language.sk, label: "Slovak" }
                ]}
            />
            </Flex>
        </Header>
    );
}