import { NextRequest, NextResponse } from 'next/server'

import { CookieKey } from '@/app/utils/enums'
import { getCookie, setCookie } from '@/app/utils/serverFunctions'

const cookieAge = 60 * 60 * 24 * 365

export async function GET() {
    try {
        const basketItems = (await getCookie(CookieKey.Basket)) || []

        return NextResponse.json({
            basketItems
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
        const body = await req.json()

        const basket = (await getCookie(CookieKey.Basket)) || []

        const existing = basket.find((i: any) =>
            i.goodID === body.goodID && i.pricingID === body.pricingID)

        if (existing) {
            existing.quantity += body.quantity
        } else {
            basket.push({
                id: `${body.goodID}:${body.pricingID}`,
                goodID: body.goodID,
                pricingID: body.pricingID,
                quantity: body.quantity,
                createdAt: body.createdAt ?? new Date().toISOString()
            })
        }

        await setCookie(CookieKey.Basket, basket, cookieAge)

        return NextResponse.json({
            basketItems: basket,
            message: 'Item added'
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
        const body = await req.json()

        const basket = (await getCookie(CookieKey.Basket)) || []

        const newBasket: any[] = []

        basket.forEach((item: any) => {
            const isUpdated = body.basketItems.find((i: any) => `${i.goodID}:${i.pricingID}` === item.id)

            if (!isUpdated) {
                newBasket.push(item)
            } else {
                newBasket.push({
                    ...item,
                    quantity: isUpdated.quantity
                })
            }
        })
        await setCookie(CookieKey.Basket, newBasket, cookieAge)

        return NextResponse.json({
            message: 'Items updated'
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
        const body = await req.json()
        const basket = (await getCookie(CookieKey.Basket)) || []
        const newBasket: any[] = []

        basket.forEach((item: any) => {
            const isDeleted = body.basketItems.find((i: any) => `${i.goodID}:${i.pricingID}` === item.id)

            if (!isDeleted) {
                newBasket.push(item)
            }
        })

        await setCookie(CookieKey.Basket, newBasket, cookieAge)

        return NextResponse.json({
            message: 'Items deleted'
        })
    } catch (error: any) {
        return NextResponse.json(
            { message: error.message },
            { status: 500 }
        )
    }
}