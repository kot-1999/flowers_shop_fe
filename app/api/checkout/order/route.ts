import { NextRequest, NextResponse } from 'next/server'

import { CookieKey } from '@/app/utils/enums'
import { getCookie, getRequiredHeaders } from '@/app/utils/serverFunctions'

const BACKEND_URL = process.env.BACKEND_URL

export async function POST(req: NextRequest) {
    try {
        const headers: any = await getRequiredHeaders(req)
        const body = await req.json()
        const auth = req.headers.get('authorization')

        if (auth) {
            headers['Authorization'] = auth
        }
        
        const basketItems = await getCookie(CookieKey.Basket) ?? []

        const response = await fetch(
            `${BACKEND_URL}/api/v1/checkout/order`,
            {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    ...body,
                    basketItems: basketItems?.map((item: any) => ({
                        pricingID: item.pricingID,
                        quantity: item.quantity,
                        createdAt: item.createdAt
                    }))
                })
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