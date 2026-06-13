import {theme} from "antd";

export const lightTheme = {
    algorithm: theme.defaultAlgorithm,

        token: {
        // ===== CORE BRAND (soft floral blue) =====
        colorPrimary: '#4f8cff',     // fresh sky blue (main CTA)
            colorInfo: '#6aa9ff',        // lighter sky variant
            colorSuccess: '#3fbf9a',     // soft plant green
            colorWarning: '#f2b84b',     // pollen gold
            colorError: '#ff6b6b',

            // ===== TEXT =====
            colorTextBase: '#1f2328',
            colorText: '#2b2f36',
            colorTextSecondary: '#5b6470',
            colorTextTertiary: '#8a94a3',

            // ===== BACKGROUNDS =====
            colorBgBase: '#f7f9fc',
            colorBgLayout: '#f3f6fb',     // airy cool background
            colorBgContainer: '#ffffff',
            colorBgElevated: '#ffffff',

            // ===== SUBTLE ACCENTS =====
            colorFillAlter: '#eef5ff',    // very soft blue wash
            colorFillSecondary: '#edf7f3',// soft green wash

            // ===== BORDERS =====
            colorBorder: 'rgba(30, 35, 45, 0.08)',
            colorBorderSecondary: 'rgba(30, 35, 45, 0.05)',

            // ===== SHAPES =====
            borderRadius: 18,
            borderRadiusLG: 24,
            borderRadiusSM: 12,

            // ===== TYPOGRAPHY =====
            fontSize: 14,

            // ===== EFFECTS =====
            boxShadow: '0 10px 28px rgba(30, 35, 45, 0.08)',

            controlHeight: 42,
    },

    components: {
        Layout: {
            bodyBg: '#f3f6fb',
                headerBg: '#ffffff',
                siderBg: '#ffffff',
                triggerBg: '#ffffff',
        },

        Card: {
            colorBgContainer: '#ffffff',
                borderRadiusLG: 24,
                boxShadow: '0 12px 30px rgba(30, 35, 45, 0.06)',
                paddingLG: 18,
        },

        Button: {
            borderRadius: 14,
                controlHeight: 40,

                defaultBg: '#ffffff',
                defaultBorderColor: 'rgba(30, 35, 45, 0.10)',
                defaultColor: '#2b2f36',

                colorPrimary: '#4f8cff',
                primaryColor: '#ffffff',
                primaryShadow: '0 8px 18px rgba(79, 140, 255, 0.25)',
        },

        Input: {
            borderRadius: 14,
                controlHeight: 40,

                colorBgContainer: '#ffffff',
                activeBorderColor: '#4f8cff',
                hoverBorderColor: '#7aa7ff',
        },

        Select: {
            borderRadius: 14,
                controlHeight: 40,

                colorBgContainer: '#ffffff',
                optionSelectedBg: '#eef5ff',
        },

        Table: {
            colorBgContainer: '#ffffff',
                headerBg: '#f6f8fc',
                rowHoverBg: '#eef5ff',
                borderColor: 'rgba(30, 35, 45, 0.06)',
                borderRadius: 18,
        },

        Menu: {
            itemColor: '#4b5563',
                darkItemSelectedBg: '#eef5ff',
                darkItemSelectedColor: '#4f8cff',
                darkItemHoverBg: '#f1f6ff',
        },

        Tabs: {
            itemColor: '#6b7280',
                itemSelectedColor: '#4f8cff',
                itemHoverColor: '#7aa7ff',
                inkBarColor: '#4f8cff',
        },

        Tag: {
            defaultBg: '#eef5ff',
                borderRadiusSM: 999,
        },

        Tooltip: {
            colorBgSpotlight: '#2b2f36',
        },

        Progress: {
            remainingColor: 'rgba(0,0,0,0.06)',
        },

        Modal: {
            contentBg: '#ffffff',
                headerBg: '#ffffff',
                borderRadiusLG: 28,
        },
    },
}

export const darkTheme = {
    algorithm: theme.darkAlgorithm,

        token: {
        // ===== CORE BRAND (same blue, adjusted for dark UI) =====
        colorPrimary: '#5aa2ff',     // softer luminous blue for dark mode
            colorInfo: '#6fb3ff',
            colorSuccess: '#4ad3a6',
            colorWarning: '#f2c14e',
            colorError: '#ff6b6b',

            // ===== TEXT =====
            colorTextBase: '#e8eef7',
            colorText: '#d6deea',
            colorTextSecondary: '#9aa6b2',
            colorTextTertiary: '#6f7c8a',

            // ===== BACKGROUNDS =====
            colorBgBase: '#0b1220',       // deep navy (not pure black)
            colorBgLayout: '#0d1626',
            colorBgContainer: '#121c2e',
            colorBgElevated: '#16223a',

            // ===== SUBTLE ACCENTS =====
            colorFillAlter: 'rgba(90, 162, 255, 0.08)', // soft blue glow
            colorFillSecondary: 'rgba(74, 211, 166, 0.06)', // soft green tint

            // ===== BORDERS =====
            colorBorder: 'rgba(255, 255, 255, 0.08)',
            colorBorderSecondary: 'rgba(255, 255, 255, 0.05)',

            // ===== SHAPES =====
            borderRadius: 18,
            borderRadiusLG: 24,
            borderRadiusSM: 12,

            // ===== TYPOGRAPHY =====
            fontSize: 14,

            // ===== EFFECTS =====
            boxShadow: '0 12px 30px rgba(0, 0, 0, 0.35)',

            controlHeight: 42,
    },

    components: {
        Layout: {
            bodyBg: '#0b1220',
                headerBg: '#121c2e',
                siderBg: '#121c2e',
                triggerBg: '#121c2e',
        },

        Card: {
            colorBgContainer: '#121c2e',
                borderRadiusLG: 24,
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.35)',
                paddingLG: 18,
        },

        Button: {
            borderRadius: 14,
                controlHeight: 40,

                defaultBg: '#16223a',
                defaultBorderColor: 'rgba(255, 255, 255, 0.08)',
                defaultColor: '#d6deea',

                colorPrimary: '#5aa2ff',
                primaryColor: '#ffffff',
                primaryShadow: '0 10px 20px rgba(90, 162, 255, 0.25)',
        },

        Input: {
            borderRadius: 14,
                controlHeight: 40,

                colorBgContainer: '#121c2e',
                activeBorderColor: '#5aa2ff',
                hoverBorderColor: '#7ab6ff',
        },

        Select: {
            borderRadius: 14,
                controlHeight: 40,

                colorBgContainer: '#121c2e',
                optionSelectedBg: 'rgba(90, 162, 255, 0.12)',
        },

        Table: {
            colorBgContainer: '#121c2e',
                headerBg: '#16223a',
                rowHoverBg: 'rgba(90, 162, 255, 0.08)',
                borderColor: 'rgba(255, 255, 255, 0.06)',
                borderRadius: 18,
        },

        Menu: {
            itemColor: '#a9b4c2',
                darkItemBg: 'transparent',
                darkItemHoverBg: 'rgba(90, 162, 255, 0.08)',
                darkItemSelectedBg: 'rgba(90, 162, 255, 0.15)',
                darkItemSelectedColor: '#5aa2ff',
        },

        Tabs: {
            itemColor: '#9aa6b2',
                itemSelectedColor: '#5aa2ff',
                itemHoverColor: '#7ab6ff',
                inkBarColor: '#5aa2ff',
        },

        Tag: {
            defaultBg: 'rgba(90, 162, 255, 0.12)',
                borderRadiusSM: 999,
        },

        Tooltip: {
            colorBgSpotlight: '#16223a',
        },

        Progress: {
            remainingColor: 'rgba(255, 255, 255, 0.08)',
        },

        Modal: {
            contentBg: '#121c2e',
                headerBg: '#121c2e',
                borderRadiusLG: 28,
        },
    },
}