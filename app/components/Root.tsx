'use client'

import {ConfigProvider, FloatButton, Layout, Space, theme, Typography} from "antd";
import { UpOutlined } from "@ant-design/icons";
import AppHeader from "@/app/components/AppHeader";
import {AuthProvider} from "@/app/components/AuthContent";
import AppSidebar from "@/app/components/AppSidebar";
import {useEffect, useState} from "react";

const { Content, Footer } = Layout;
const { Text } = Typography;

export const Root = ({ children }: { children: React.ReactNode }) => {
    const year = new Date().getFullYear();

    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 1024);
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);

    return (
        <AuthProvider>
            <ConfigProvider
                theme={{
                    algorithm: theme.darkAlgorithm,

                    token: {
                        // ===== CORE PALETTE =====
                        colorPrimary: '#8ed7ff',

                        colorSuccess: '#7bd88f',
                        colorWarning: '#f4c56a',
                        colorError: '#ff6b6b',
                        colorInfo: '#73c7ff',

                        // ===== TEXT =====
                        colorTextBase: '#edf3f7',
                        colorText: '#d7e1e7',
                        colorTextSecondary: '#8fa1aa',
                        colorTextTertiary: '#6c7d86',

                        // ===== BACKGROUNDS =====
                        colorBgBase: '#0c151a',
                        colorBgLayout: '#0c151a',

                        colorBgContainer: '#27383f',
                        colorBgElevated: '#31424a',

                        // ===== BORDERS =====
                        colorBorder: 'rgba(255,255,255,0.05)',
                        colorBorderSecondary: 'rgba(255,255,255,0.03)',

                        // ===== SHAPES =====
                        borderRadius: 18,
                        borderRadiusLG: 24,
                        borderRadiusSM: 12,

                        // ===== TYPOGRAPHY =====
                        fontSize: 14,

                        // ===== EFFECTS =====
                        boxShadow: `
                0 8px 30px rgba(0,0,0,0.35)
            `,

                        controlHeight: 42,
                    },

                    components: {
                        Layout: {
                            bodyBg: '#0c151a',
                            headerBg: '#18272c',
                            siderBg: '#18272c',
                            triggerBg: '#18272c',
                        },

                        Card: {
                            colorBgContainer: '#27383f',

                            borderRadiusLG: 24,

                            boxShadow: `
                    0 10px 30px rgba(0,0,0,0.28)
                `,

                            paddingLG: 18,
                        },

                        Button: {
                            borderRadius: 14,

                            controlHeight: 40,

                            defaultBg: '#18272c',

                            defaultBorderColor: 'rgba(255,255,255,0.04)',

                            defaultColor: '#dce7ec',

                            colorPrimary: '#343d42',

                            primaryColor: '#ffffff',

                            primaryShadow: 'none',
                        },

                        Input: {
                            borderRadius: 14,

                            controlHeight: 40,

                            colorBgContainer: '#18272c',

                            activeBg: '#18272c',

                            hoverBg: '#18272c',

                            activeBorderColor: '#46545b',

                            hoverBorderColor: '#46545b',
                        },

                        Select: {
                            borderRadius: 14,

                            controlHeight: 40,

                            colorBgContainer: '#18272c',

                            optionSelectedBg: '#343d42',

                            selectorBg: '#18272c',
                        },

                        Dropdown: {
                            colorBgElevated: '#27383f',

                            borderRadiusLG: 18,
                        },

                        Modal: {
                            contentBg: '#27383f',

                            headerBg: '#27383f',

                            borderRadiusLG: 28,
                        },

                        Table: {
                            colorBgContainer: '#27383f',

                            headerBg: '#31424a',

                            headerColor: '#dbe6eb',

                            rowHoverBg: '#343d42',

                            borderColor: 'rgba(255,255,255,0.04)',

                            borderRadius: 18,
                        },

                        Menu: {
                            darkItemBg: 'transparent',

                            darkSubMenuItemBg: 'transparent',

                            darkItemSelectedBg: '#343d42',

                            darkItemHoverBg: '#31424a',

                            darkItemSelectedColor: '#ffffff',

                            itemColor: '#93a5ae',
                        },

                        Tabs: {
                            itemColor: '#7f9199',

                            itemSelectedColor: '#ffffff',

                            itemHoverColor: '#dce7ec',

                            inkBarColor: '#8ed7ff',
                        },

                        Tag: {
                            defaultBg: '#31424a',

                            borderRadiusSM: 999,
                        },

                        Tooltip: {
                            colorBgSpotlight: '#31424a',
                        },

                        Progress: {
                            remainingColor: 'rgba(255,255,255,0.06)',
                        },

                        Statistic: {
                            contentFontSize: 24,
                        },
                    },
                }}
            >
                <Layout style={{ minHeight: "100vh" }}>
                    {/* SIDEBAR ONLY ON DESKTOP */}
                    {!isMobile && <AppSidebar />}

                    {/* MAIN COLUMN */}
                    <Layout
                        style={{
                            minHeight: '100vh',
                        }}
                    >
                        {/* HEADER ONLY ON MOBILE */}
                        {isMobile && <AppHeader />}
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
                            <Space direction="vertical" size={4}>
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