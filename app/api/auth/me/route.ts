import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL

export async function GET(req: NextRequest) {
    try {
        const response = await fetch(`${BACKEND_URL}/api/v1/authorization/me`, {
            method: 'GET',
            headers: {
                cookie: req.headers.get('cookie') || '',
            },
        })

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