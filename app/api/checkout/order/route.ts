import { NextRequest, NextResponse } from 'next/server'

import { CookieKey } from '@/app/utils/enums'
import { getCookie, getRequiredHeaders, setCookie } from '@/app/utils/serverFunctions'

const BACKEND_URL = process.env.BACKEND_URL

const cookieAge = 60 * 60 * 24 * 365

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

        if (response.ok && auth) {
            const updatedBasket = []

            for (const item of basketItems) {
                const isPurchased = data.order.pricings.find((pricingID: string) => pricingID === item.pricingID)

                if (!isPurchased) {
                    updatedBasket.push(item)
                }
            }

            setCookie(CookieKey.Basket, updatedBasket, cookieAge)
        }
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