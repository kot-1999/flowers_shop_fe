import { NextRequest, NextResponse } from 'next/server'

import { getRequiredHeaders } from '@/app/utils/serverFunctions'

const BACKEND_URL = process.env.BACKEND_URL

export async function GET(
    req: NextRequest,
    context: {
        params: Promise<{ orderID: string }>
    }
) {
    try {
        const { orderID } = await context.params

        const headers: any = await getRequiredHeaders(req)

        const auth = req.headers.get('authorization')

        if (auth) {
            headers['Authorization'] = auth
        }

        const response = await fetch(
            `${BACKEND_URL}/api/v1/checkout/order/${orderID}`,
            {
                method: 'GET',
                headers
            }
        )

        const data = await response.json()

        return NextResponse.json(data, {
            status: response.status
        })
    } catch (error: any) {
        return NextResponse.json(
            {
                message: error.message
            },
            {
                status: 500
            }
        )
    }
}