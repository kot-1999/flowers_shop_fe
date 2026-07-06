import { NextRequest, NextResponse } from 'next/server'

import { getRequiredHeaders } from '@/app/utils/serverFunctions'

const BACKEND_URL = process.env.BACKEND_URL

export async function GET(req: NextRequest) {
    try {
        const headers = await getRequiredHeaders(req)

        const response = await fetch(
            `${BACKEND_URL}/api/v1/addresses`,
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

export async function PUT(req: NextRequest) {
    try {
        const headers: any = await getRequiredHeaders(req)
        const body = await req.json()
        const auth = req.headers.get('authorization')

        if (auth) {
            headers['Authorization'] = auth
        }
        const response = await fetch(
            `${BACKEND_URL}/api/v1/addresses`,
            {
                method: 'PUT',
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