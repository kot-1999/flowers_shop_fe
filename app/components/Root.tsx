'use client'

import { UpOutlined } from '@ant-design/icons'
import { ConfigProvider, FloatButton, Layout, Space, Typography } from 'antd'
import { useEffect, useState } from 'react'

import AppHeader from '@/app/components/AppHeader'
import AppSidebar from '@/app/components/AppSidebar'
import { AuthProvider } from '@/app/components/AuthContent'
import { darkTheme, lightTheme } from '@/app/utils/themes'
import { ThemeMode } from '@/app/utils/types'

const { Content, Footer } = Layout
const { Text } = Typography

export const Root = ({ children }: { children: React.ReactNode }) => {
    const [isMobile, setIsMobile] = useState(false)
    const [themeMode, setThemeMode] = useState<ThemeMode>('system')

    const [systemIsDark, setSystemIsDark] = useState(false)

    const isDark = themeMode === 'dark'
        || (themeMode === 'system' && systemIsDark)

    const setDark = (value: boolean) => {
        setThemeMode(value ? 'dark' : 'light')
    }

    // Mobile detection
    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 1024)

        check()
        window.addEventListener('resize', check)

        return () => window.removeEventListener('resize', check)
    }, [])

    // System theme listener (IMPORTANT upgrade)
    useEffect(() => {
        if (typeof window === 'undefined') {
            return
        }

        const mq = window.matchMedia('(prefers-color-scheme: dark)')

        const update = () => setSystemIsDark(mq.matches)

        update()

        mq.addEventListener?.('change', update)

        return () => mq.removeEventListener?.('change', update)
    }, [])

    useEffect(() => {
        document.documentElement.classList.toggle('dark', isDark)
    }, [isDark])

    return (
        <AuthProvider>
            <ConfigProvider
                theme={isDark ? darkTheme : lightTheme}
            >
                <Layout style={{ minHeight: '100vh' }}>
                    {/* SIDEBAR ONLY ON DESKTOP */}
                    {!isMobile && <AppSidebar isDark={isDark} setDark={setDark}/>}

                    {/* MAIN COLUMN */}
                    <Layout
                        style={{
                            minHeight: '100vh'
                        }}
                    >
                        {/* HEADER ONLY ON MOBILE */}
                        {isMobile && <AppHeader isDark={isDark} setDark={setDark}/>}
                        <Content style={{ padding: 24 }}>
                            <FloatButton.BackTop
                                icon={<UpOutlined />}
                                style={{
                                    right: 50,
                                    bottom: 50,
                                    width: 64,
                                    height: 64,
                                    boxShadow: '-moz-initial',
                                    borderWidth: 5
                                }}
                            />
                            {children}
                        </Content>

                        {/* FOOTER ALWAYS INSIDE MAIN LAYOUT */}
                        <Footer style={{ textAlign: 'center' }}>
                            <Space orientation="vertical" size={4}>
                                <Text>Flowers Shop</Text>
                                <Text type="secondary">© {new Date().getFullYear()}</Text>
                            </Space>
                        </Footer>
                    </Layout>
                </Layout>
            </ConfigProvider>
        </AuthProvider>
    )
}