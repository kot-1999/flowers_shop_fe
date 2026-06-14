'use client'

import {
    MenuOutlined, MoonOutlined, SunOutlined
} from '@ant-design/icons'
import { Button, Drawer, Flex, Menu, Select, Space, Switch, Typography } from 'antd'
import { Header } from 'antd/es/layout/layout'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { useAuth } from '@/app/components/AuthContent'
import { Language, LocalStorageKey } from '@/app/utils/enums'
import { fetchSettings, languageOptions, removeLocalStorage, getTFunc } from '@/app/utils/helpers'
import { getMenuItems } from '@/app/utils/menuItems'

const { Text } = Typography
export default function AppHeader({ isDark, setDark }: { isDark: boolean, setDark: (val: boolean) => void }) {
    const { user } = useAuth()
    const t = getTFunc()
    const router = useRouter()

    const pathname = usePathname()
    const [drawerOpen, setDrawerOpen] = useState(false)

    const currentLocale = pathname.split('/')[1] as Language

    const [settings, setSettings] = useState<any>(null)
    const [, locale, ...rest] = pathname.split('/')
    const [categories, setCategories] = useState<any>([])

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const res = await fetch('/api/categories')
                const data = await res.json()

                setCategories(data.categories)

            } catch (err) {
                console.error(err)
            }
        }

        loadCategories()
    }, [locale])
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
    }, [locale])

    async function changeLanguage(nextLocale: Language) {
        await fetch('/api/cookie/settings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                locale: nextLocale
            })
        })

        const newPath = pathname.replace(
            `/${currentLocale}`,
            `/${nextLocale}`
        )

        router.push(newPath)
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
                    transition: 'box-shadow 0.2s ease'
                }}
            >
                <Flex
                    justify="space-between"
                    align="center"
                    style={{
                        width: '100%',
                        height: '100%' 
                    }}
                >
                    <Link
                        href="/"
                        className="text-white text-xl font-semibold no-underline"
                        onClick={() => {
                            removeLocalStorage(LocalStorageKey.SelectedCategory)
                            removeLocalStorage(LocalStorageKey.SearchSettings)
                            removeLocalStorage(LocalStorageKey.HomePagination)
                        }}
                    >
                        🌸 Flowers Shop
                    </Link>

                    <Flex align="center" gap={10}>
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
                        height: '100%'
                    }
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
                        overflowY: 'auto'
                    }}
                    items={getMenuItems({
                        user,
                        settings,
                        categories,
                        setDrawerOpen 
                    })}
                />

                <div style={{ padding: 12  }}>
                    <div
                        style={{
                            padding: 12,
                            flexShrink: 0,
                            borderTop: '1px solid rgba(255,255,255,0.06)'
                        }}
                    >
                        {/* THEME ROW */}
                        <Flex justify="space-between" align="center" style={{ marginBottom: 10 }}>

                            <Space size={8} align="center">
                                {isDark ? <MoonOutlined /> : <SunOutlined />}
                                <Text type="secondary">
                                    {isDark ? t('Dark mode') : t('Light mode')}
                                </Text>
                            </Space>

                            <Switch
                                checked={isDark}
                                onChange={setDark}
                                checkedChildren={t('Dark')}
                                unCheckedChildren={t('Light')}
                                size="small"
                            />
                        </Flex>

                        {/* LANGUAGE ROW */}
                        <div style={{ marginTop: 8 }}>
                            <Select
                                value={currentLocale}
                                onChange={changeLanguage}
                                options={languageOptions}
                                style={{ width: '100%' }}
                            />
                        </div>
                    </div>
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
    )
}