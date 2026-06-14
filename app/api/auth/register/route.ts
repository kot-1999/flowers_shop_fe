import { NextRequest, NextResponse } from 'next/server'

import { encryptAES, getRequiredHeaders } from '@/app/utils/serverFunctions'

const BACKEND_URL = process.env.BACKEND_URL

export async function POST(req: NextRequest) {
    try {
        const [body, headers] = await Promise.all([req.json(), getRequiredHeaders(req)])

        const response = await fetch(
            `${BACKEND_URL}/api/v1/authorization/register`,
            {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    ...body,
                    password: await encryptAES(body.password)
                })
            }
        )
        const data = await response.json()

        return NextResponse.json(data, {
            status: response.status
        })
    } catch (error: any) {
        return NextResponse.json(
            {
                message: error.message
            },
            {
                status: 500
            }
        )
    }
}