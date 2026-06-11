import { NextRequest, NextResponse } from 'next/server'
import { getRequiredHeaders } from '@/app/utils/serverFunctions'

const BACKEND_URL = process.env.BACKEND_URL

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ categoryID: string }> }
) {
    try {
        const { categoryID } = await params
        const headers = await getRequiredHeaders(req)

        const response = await fetch(
            `${BACKEND_URL}/api/v1/admin/categories/${categoryID}`,
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