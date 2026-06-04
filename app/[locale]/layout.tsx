import "../globals.css";

import enMessages from "@/locales/en.json";
import uaMessages from "@/locales/ua.json";
import skMessages from "@/locales/sk.json";
import deMessages from "@/locales/de.json";

import IntlProviderClient from "@/app/components/IntlProviderClient";
import {Root} from "@/app/components/Root";
import {Language} from "@/app/utils/enums";
import {notFound} from "next/navigation";
import {getMessages} from "@/app/i18n/messages";

const messagesMap:  Record<Language, Record<string, string>> = {
    en: enMessages,
    ua: uaMessages,
    de: deMessages,
    sk: skMessages,

}
const supportedLocales = Object.values(Language)

export default async function RootLayout({ children, params }: { children: React.ReactNode, params: { locale: Language | undefined }  }) {

    const locale: Language = (await params).locale ?? Language.en
    const messages = await getMessages(locale)


    if (!supportedLocales.includes(locale)) {
        notFound();
    }
    console.log('Root', locale);
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
    );
}