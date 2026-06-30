import { NextRequest, NextResponse } from 'next/server'

import { CookieKey } from '@/app/utils/enums'
import { getCookie, getRequiredHeaders } from '@/app/utils/serverFunctions'

const BACKEND_URL = process.env.BACKEND_URL

export async function POST(req: NextRequest) {
    try {
        const headers = await getRequiredHeaders(req)
        const basketItems = await getCookie(CookieKey.Basket)

        const response = await fetch(
            `${BACKEND_URL}/api/v1/public/basket-items`,
            {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    basketItems: basketItems.map((item: any) => ({
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