import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()

        const response = await fetch(
            `${BACKEND_URL}/api/v1/authorization/forgot-password`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: body.email,
                }),
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