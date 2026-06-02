import { NextRequest, NextResponse } from 'next/server'
import { encryptAES } from "@/app/utils/serverFunctions"

const BACKEND_URL = process.env.BACKEND_URL

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const response = await fetch(
            `${BACKEND_URL}/api/v1/authorization/reset-password`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // IMPORTANT: forward JWT token from Authorization header or cookies
                    'Authorization': req.headers.get('authorization') || '',
                    cookie: req.headers.get('cookie') || '',
                },
                body: JSON.stringify({
                    newPassword: await encryptAES(body.newPassword),
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