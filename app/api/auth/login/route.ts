import { NextRequest, NextResponse } from 'next/server'
import {encryptAES, getRequiredHeaders} from "@/app/utils/serverFunctions"

const BACKEND_URL = process.env.BACKEND_URL

export async function POST(req: NextRequest) {
    try {
        const [body, headers] = await Promise.all([req.json(), getRequiredHeaders(req)])

        const response = await fetch(
            `${BACKEND_URL}/api/v1/authorization/login`,
            {
                method: 'POST',
                headers,
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