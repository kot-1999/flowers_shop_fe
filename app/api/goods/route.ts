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