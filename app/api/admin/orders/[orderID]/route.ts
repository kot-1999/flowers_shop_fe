import { NextRequest, NextResponse } from 'next/server'

import { getRequiredHeaders } from '@/app/utils/serverFunctions'

const BACKEND_URL = process.env.BACKEND_URL

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ orderID: string }> }
) {
    try {
        const { orderID } = await params
        const headers = await getRequiredHeaders(req)

        const response = await fetch(
            `${BACKEND_URL}/api/v1/admin/orders/${orderID}`,
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
            { message: error.message },
            { status: 500 }
        )
    }
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ orderID: string }> }
) {
    try {
        const { orderID } = await params
        const headers = await getRequiredHeaders(req)

        const response = await fetch(
            `${BACKEND_URL}/api/v1/admin/orders/${orderID}`,
            {
                method: 'PATCH',
                headers
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