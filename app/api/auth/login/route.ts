import { NextRequest, NextResponse } from 'next/server'
import { encryptAES } from "@/app/utils/serverFunctions"

const BACKEND_URL = process.env.BACKEND_URL

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()

        const response = await fetch(
            `${BACKEND_URL}/api/v1/authorization/login`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...body,
                    password: await encryptAES(body.password),
                }),
            }
        )

        const data = await response.json()

        // Create response
        const nextResponse = NextResponse.json(data, {
            status: response.status,
        })

        // Extract and forward session cookie from backend
        const setCookieHeader = response.headers.get('set-cookie')
        if (setCookieHeader) {
            nextResponse.headers.set('set-cookie', setCookieHeader)
        }

        return nextResponse
    } catch (error: any) {
        return NextResponse.json(
            {
                message: error.message,
            },
            {
                status: 500,
            }
        )
    }
}