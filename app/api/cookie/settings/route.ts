import { NextRequest, NextResponse } from 'next/server'

import { CookieKey } from '@/app/utils/enums'
import { getCookie, setCookie } from '@/app/utils/serverFunctions'

export async function GET() {
    try {
        const settings = await getCookie(CookieKey.Settings)

        return NextResponse.json(settings ?? null)
    } catch (error: any) {
        return NextResponse.json({
            message: error?.message ?? 'Failed to get cookie',
            status: 500 
        })
    }
}

export async function POST(request: NextRequest) {
    try {
        const [body, settings] = await Promise.all([request.json(), getCookie(CookieKey.Settings)])

        const data = {
            ...settings,
            ...body
        }
        await setCookie(CookieKey.Settings, data, 60 * 60 * 24 * 365)

        return NextResponse.json(data, { status: 200 })

    } catch (error: any) {
        return NextResponse.json({
            message: error?.message ?? 'Failed to set cookie',
            status: 500 
        })
    }
}