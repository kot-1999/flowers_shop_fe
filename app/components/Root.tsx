'use client'

import {ConfigProvider, FloatButton, Layout, Space, theme, Typography} from "antd";
import { UpOutlined } from "@ant-design/icons";
import AppHeader from "@/app/components/AppHeader";
import {AuthProvider} from "@/app/components/AuthContent";
import AppSidebar from "@/app/components/AppSidebar";
import {useEffect, useMemo, useState} from "react";
import {ThemeMode} from "@/app/utils/types";
import {darkTheme, lightTheme} from "@/app/utils/themes";

const { Content, Footer } = Layout;
const { Text } = Typography;

export const Root = ({ children }: { children: React.ReactNode }) => {
    const [isMobile, setIsMobile] = useState(false);
    const [themeMode, setThemeMode] = useState<ThemeMode>("system");

    // 🌙 system theme state (reactive, not one-time memo)
    const [systemIsDark, setSystemIsDark] = useState(false);

    // 🌗 computed theme
    const isDark = themeMode === "dark"
        || (themeMode === "system" && systemIsDark);

    // 🎨 helpers (clean API)
    const setDark = (value: boolean) => {
        setThemeMode(value ? "dark" : "light");
    };

    const setSystemTheme = () => setThemeMode("system");

    // 📱 mobile detection
    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 1024);

        check();
        window.addEventListener("resize", check);

        return () => window.removeEventListener("resize", check);
    }, []);

    // 🌙 system theme listener (IMPORTANT upgrade)
    useEffect(() => {
        if (typeof window === "undefined") return;

        const mq = window.matchMedia("(prefers-color-scheme: dark)");

        const update = () => setSystemIsDark(mq.matches);

        update();

        mq.addEventListener?.("change", update);

        return () => mq.removeEventListener?.("change", update);
    }, []);

    useEffect(() => {
        document.documentElement.classList.toggle("dark", isDark);
    }, [isDark]);

    return (
        <AuthProvider>
            <ConfigProvider
                theme={isDark ? darkTheme : lightTheme}
            >
                <Layout style={{ minHeight: "100vh" }}>
                    {/* SIDEBAR ONLY ON DESKTOP */}
                    {!isMobile && <AppSidebar isDark={isDark} setDark={setDark}/>}

                    {/* MAIN COLUMN */}
                    <Layout
                        style={{
                            minHeight: '100vh',
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
                                borderWidth: 5,
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