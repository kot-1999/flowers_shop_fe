import { NextRequest, NextResponse } from 'next/server'
import { getRequiredHeaders } from '@/app/utils/serverFunctions'

const BACKEND_URL = process.env.BACKEND_URL

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ itemTypeID: string }> }
) {
    try {
        const { itemTypeID } = await params
        const headers = await getRequiredHeaders(req)

        const response = await fetch(
            `${BACKEND_URL}/v1/admin/item-types/${itemTypeID}`,
            {
                method: 'DELETE',
                headers,
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