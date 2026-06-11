import { NextRequest, NextResponse } from 'next/server'
import { getRequiredHeaders } from '@/app/utils/serverFunctions'

const BACKEND_URL = process.env.BACKEND_URL

export async function GET(req: NextRequest) {
    try {
        const headers = await getRequiredHeaders(req)

        const response = await fetch(
            `${BACKEND_URL}/api/v1/admin/tags`,
            {
                method: 'GET',
                headers,
            }
        )

        const data = await response.json()

        return NextResponse.json(data, {
            status: response.status,
        })
    } catch (error: any) {
        return NextResponse.json(
            { message: error.message },
            { status: 500 }
        )
    }
}

export async function PUT(req: NextRequest) {
    try {
        const [body, headers] = await Promise.all([
            req.json(),
            getRequiredHeaders(req),
        ])

        const response = await fetch(
            `${BACKEND_URL}/v1/admin/tags`,
            {
                method: 'PUT',
                headers,
                body: JSON.stringify(body),
            }
        )

        const data = await response.json()

        return NextResponse.json(data, {
            status: response.status,
        })
    } catch (error: any) {
        return NextResponse.json(
            { message: error.message },
            { status: 500 }
        )
    }
}