'use client'

import { MoonOutlined, SunOutlined } from '@ant-design/icons'
import { Layout, Menu, Select, Space, Switch, Typography, Flex } from 'antd'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { useAuth } from '@/app/components/AuthContent'
import { Language, LocalStorageKey } from '@/app/utils/enums'
import { fetchSettings, languageOptions, removeLocalStorage, getTFunc } from '@/app/utils/helpers'
import { getMenuItems } from '@/app/utils/menuItems'

const { Text } = Typography

const { Sider } = Layout

export default function AppSidebar({ isDark, setDark }: { isDark: boolean, setDark: (val: boolean) => void }) {
    const { user } = useAuth()
    const router = useRouter()
    const pathname = usePathname()
    const t = getTFunc()
    const currentLocale = pathname.split('/')[1] as Language
    const [collapsed, setCollapsed] = useState(false)
    const [settings, setSettings] = useState<any>(null)
    const [, locale, ...rest] = pathname.split('/')
    const [categories, setCategories] = useState<any>([])

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const res = await fetch('/api/categories')
                const data = await res.json()

                setCategories(data.categories)
                console.log(data.categories, settings)

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
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ locale: nextLocale })
        })

        const newPath = pathname.replace(`/${currentLocale}`, `/${nextLocale}`)
        router.push(newPath)
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
                left: 0
            }}
        >
            {/* IMPORTANT: internal flex container */}
            <div
                style={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden'
                }}
            >
                {/* HEADER (fixed) */}
                <div
                    style={{
                        height: 64,
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0 16px',
                        flexShrink: 0
                    }}
                >
                    <Link
                        href={'/'}
                        className="text-white text-xl font-semibold no-underline"
                        onClick={() => {
                            removeLocalStorage(LocalStorageKey.SelectedCategory)
                            removeLocalStorage(LocalStorageKey.SearchSettings)
                            removeLocalStorage(LocalStorageKey.HomePagination)
                        }}
                    >
                        🌸 {!collapsed ? ' Flowers Shop' : ''}
                    </Link>
                </div>

                {/* SCROLLABLE MENU AREA */}
                <div
                    style={{
                        flex: 1,
                        overflowY: 'auto'
                    }}
                >
                    <Menu
                        mode="inline"
                        selectedKeys={['/' + rest.join('/')]}
                        defaultOpenKeys={['categories', 'account']}
                        style={{
                            borderRight: 0
                        }}
                        items={getMenuItems({
                            user,
                            settings,
                            categories 
                        })}
                    />
                </div>

                {/* BOTTOM SECTION (fixed) */}
                <div
                    style={{
                        padding: 12,
                        flexShrink: 0,
                        borderTop: '1px solid rgba(255,255,255,0.06)'
                    }}
                >
                    {/* THEME ROW */}
                    <Flex justify="space-between" align="center" style={{ marginBottom: 10 }}>

                        { !collapsed
                            && <Space size={8} align="center">
                                {isDark ? <MoonOutlined /> : <SunOutlined />}
                                <Text type="secondary">
                                    {isDark ? t('Dark mode') : t('Light mode')}
                                </Text>
                            </Space>
                        }

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
            </div>
        </Sider>
    )
}