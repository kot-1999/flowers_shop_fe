'use client'

import { IntlProvider } from 'react-intl'

export default function IntlProviderClient({
    locale,
    messages,
    children
}: {
    locale: string;
    messages: Record<string, string>;
    children: React.ReactNode;
}) {
    return (
        <IntlProvider locale={locale} messages={messages}>
            {children}
        </IntlProvider>
    )
}