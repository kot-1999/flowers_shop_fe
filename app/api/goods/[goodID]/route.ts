import { NextRequest, NextResponse } from 'next/server'

import { getRequiredHeaders } from '@/app/utils/serverFunctions'

const BACKEND_URL = process.env.BACKEND_URL

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ goodID: string }> }
) {
    try {
        const { goodID } = await params
        const headers = await getRequiredHeaders(req)

        const response = await fetch(
            `${BACKEND_URL}/api/v1/goods/${goodID}`,
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
    { params }: { params: Promise<{ goodID: string }> }
) {
    try {
        const body = await req.json()
        const headers = await getRequiredHeaders(req)
        const { goodID } = await params

        const response = await fetch(
            `${BACKEND_URL}/v1/admin/goods/${goodID}`,
            {
                method: 'PATCH',
                headers,
                body: JSON.stringify(body)
            }
        )

        const data = await response.json()

        return NextResponse.json(data, {
            status: response.status
        })
    } catch (err: any) {
        return NextResponse.json(
            { message: err?.message || 'Internal error' },
            { status: 500 }
        )
    }
}