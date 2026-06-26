import { NextRequest, NextResponse } from 'next/server'

import { getRequiredHeaders } from '@/app/utils/serverFunctions'

const BACKEND_URL = process.env.BACKEND_URL

export async function GET(req: NextRequest) {
    try {
        const headers = await getRequiredHeaders(req)

        const response = await fetch(
            `${BACKEND_URL}/api/v1/basket-items`,
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
        const headers = await getRequiredHeaders(req)
        const body = await req.json()

        const response = await fetch(
            `${BACKEND_URL}/api/v1/basket-items`,
            {
                method: 'POST',
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

export async function PATCH(req: NextRequest) {
    try {
        const headers = await getRequiredHeaders(req)
        const body = await req.json()

        const res = await fetch(`${BACKEND_URL}/api/v1/basket-items`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify(body)
        })

        const data = await res.json()

        return NextResponse.json(data, {
            status: res.status
        })
    } catch (error: any) {
        return NextResponse.json(
            { message: error.message },
            { status: 500 }
        )
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const headers = await getRequiredHeaders(req)
        const body = await req.json()

        const res = await fetch(`${BACKEND_URL}/api/v1/basket-items`, {
            method: 'DELETE',
            headers,
            body: JSON.stringify({
                basketItems: body.basketItems.map((item: any) => ({
                    id: item.id
                }))
            })
        })

        const data = await res.json()

        return NextResponse.json(data, {
            status: res.status
        })
    } catch (error: any) {
        return NextResponse.json(
            { message: error.message },
            { status: 500 }
        )
    }
}