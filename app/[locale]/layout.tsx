import '../globals.css'

import { notFound } from 'next/navigation'

import IntlProviderClient from '@/app/components/IntlProviderClient'
import { Root } from '@/app/components/Root'
import { getMessages } from '@/app/i18n/messages'
import { Language } from '@/app/utils/enums'

const supportedLocales = Object.values(Language)

export default async function RootLayout({ children, params }: { children: React.ReactNode, params: { locale: Language | undefined }  }) {

    const locale: Language = (await params).locale ?? Language.en
    const messages = await getMessages(locale)

    if (!supportedLocales.includes(locale)) {
        notFound()
    }
    console.log('Root', locale)
    return (
        <html lang="en">
            <body suppressHydrationWarning>
                <IntlProviderClient locale={locale} messages={messages}>
                    <Root>
                        {children}
                    </Root>
                </IntlProviderClient>
            </body>
        </html>
    )
}