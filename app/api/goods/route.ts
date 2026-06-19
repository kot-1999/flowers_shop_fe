import { NextRequest, NextResponse } from 'next/server'

import { getRequiredHeaders } from '@/app/utils/serverFunctions'

const BACKEND_URL = process.env.BACKEND_URL

export async function GET(req: NextRequest) {
    try {
        const headers = await getRequiredHeaders(req)

        const url = new URL(req.url)
        const query = url.searchParams.toString()

        const response = await fetch(
            `${BACKEND_URL}/api/v1/goods?${query}`,
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

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const headers = await getRequiredHeaders(req)

        const response = await fetch(`${BACKEND_URL}/api/v1/admin/goods`, {
            method: 'POST',
            headers,
            body: JSON.stringify(body)
        })

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