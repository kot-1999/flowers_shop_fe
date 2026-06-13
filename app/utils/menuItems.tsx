import {
    AppstoreOutlined, DashboardOutlined, ReconciliationOutlined,
    SettingOutlined, ShopOutlined,
    ShoppingCartOutlined,
    ShoppingOutlined, TeamOutlined,
    UserOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import {removeLocalStorage, setLocalStorage, useT} from "@/app/utils/helpers";
import {LocalStorageKey, UserRole} from "@/app/utils/enums";

export function getMenuItems({
    user,
    settings,
    categories,
    setDrawerOpen
}: {
    user: any;
    settings: any,
    categories: any[]
    setDrawerOpen?: (v: boolean) => void;
}) {
    const t = useT()

    const onClick = (key: string) => {
        setDrawerOpen?.(false)
    }

    return [
        !user
            ? {
                key: '/auth/login',
                icon: <UserOutlined />,
                label: (
                    <Link href="/auth/login" onClick={() => onClick('/auth/login')}>
                        {t('Login')}
                    </Link>
                ),
            }
            : null,
        user?.role === UserRole.Admin
            ? {
                key: 'management',
                icon: <SettingOutlined />,
                label: t('Management'),
                children: [
                    {
                        key: '/management/dashboard',
                        icon: <DashboardOutlined />,
                        label: (
                            <Link
                                href="/management/dashboard"
                                onClick={() => onClick('/management/dashboard')}
                            >
                                {t('Dashboard')}
                            </Link>
                        ),
                    },
                    {
                        key: '/management/goods',
                        icon: <ShopOutlined />,
                        label: (
                            <Link
                                href="/management/goods"
                                onClick={() => onClick('/management/goods')}
                            >
                                {t('Goods')}
                            </Link>
                        ),
                    },
                    {
                        key: '/management/orders',
                        icon: <ReconciliationOutlined />,
                        label: (
                            <Link
                                href="/management/orders"
                                onClick={() => onClick('/management/orders')}
                            >
                                {t('Orders')}
                            </Link>
                        ),
                    },
                    {
                        key: '/management/users',
                        icon: <TeamOutlined />,
                        label: (
                            <Link
                                href="/management/users"
                                onClick={() => onClick('/management/users')}
                            >
                                {t('Users')}
                            </Link>
                        ),
                    },
                ],
            }
            : null,
        {
            key: 'categories',
            icon: <AppstoreOutlined />,
            label: t('Categories'),
            children: [
                {
                    key: `/`,
                    label: (
                        <Link
                            href={`/`}
                            onClick={() => {
                                onClick(`/`);
                                removeLocalStorage(LocalStorageKey.SearchSettings);
                                removeLocalStorage(LocalStorageKey.HomePagination);
                                removeLocalStorage(LocalStorageKey.SelectedCategory);
                            }}
                        >
                            {t('All Categories')}
                        </Link>
                    ),
                },
                ...categories.map((category: any) => ({
                key: `/${category.name[settings.locale + 'Slug']}`,
                label: (
                    <Link href={`/${category.name[settings.locale + 'Slug']}`} onClick={() => {
                        onClick(category.name[settings.locale + 'Slug'])
                        setLocalStorage(LocalStorageKey.SelectedCategory, category)
                        removeLocalStorage(LocalStorageKey.SearchSettings)
                        removeLocalStorage(LocalStorageKey.HomePagination)
                    }}>
                        {category.name[settings.locale as string]}
                    </Link>
                )
            }))]
        },

        {
            key: '/basket',
            icon: <ShoppingCartOutlined />,
            label: (
                <Link href="/basket" onClick={() => onClick('/basket')}>
                    {t('Basket')}
                </Link>
            ),
        },

        user
            ? {
                key: 'account',
                icon: <SettingOutlined />,
                label: t('Account'),
                children: [
                    {
                        key: '/profile',
                        icon: <UserOutlined />,
                        label: (
                            <Link href="/profile" onClick={() => '/profile'}>
                                {t('Profile')}
                            </Link>
                        ),
                    },
                    {
                        key: '/orders',
                        icon: <ShoppingOutlined />,
                        label: (
                            <Link href="/orders" onClick={() => onClick('/orders')}>
                                {t('Orders')}
                            </Link>
                        ),
                    },
                ],
            }
            : null,
    ].filter(Boolean);
}