'use client'

import { Menu} from "antd";
import Link from "next/link";

import {Header} from "antd/es/layout/layout";
import {usePathname} from "next/navigation";
import {useAuth} from "@/app/components/AuthContent";

export default function AppHeader() {
    const pathname = usePathname();
    const { user, checkAuth } = useAuth();

    return (
        <Header>
            <Menu
                theme="dark"
                mode="horizontal"
                selectedKeys={[pathname]}
                items={[
                    { key: "/", label: <Link href="/">/:Home</Link> },
                    { key: "/about", label: <Link href="/pages/about">About</Link> },
                    { key: "/login", label: <Link href="/pages/auth/login">Login</Link> },
                    user ? { key: "/pages/profile", label: <Link href="/pages/profile">Profile</Link> } : null
                ]}
            />
        </Header>
    );
}