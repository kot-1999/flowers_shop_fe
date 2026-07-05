import { NextRequest, NextResponse } from 'next/server'

import { getRequiredHeaders } from '@/app/utils/serverFunctions'

const BACKEND_URL = process.env.BACKEND_URL

export async function POST(req: NextRequest) {
    try {
        const headers = await getRequiredHeaders(req)
        const body = await req.json()

        const response = await fetch(
            `${BACKEND_URL}/api/v1/checkout/order`,
            {
                method: 'POST',
                headers,
                body: JSON.stringify(body)
            }
        )

        const data = await response.json()

        return NextResponse.json(data, {
            status: response.status
        })
    } catch (error: any) {
        return NextResponse.json(
            { message: error.message },
            { status: 500 }
        )
    }
}