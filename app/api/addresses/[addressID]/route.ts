import { NextRequest, NextResponse } from 'next/server'

import { getRequiredHeaders } from '@/app/utils/serverFunctions'

const BACKEND_URL = process.env.BACKEND_URL

interface Props {
    params: Promise<{
        addressID: string
    }>
}

export async function DELETE(
    req: NextRequest,
    { params }: Props
) {
    try {
        const headers = await getRequiredHeaders(req)
        const { addressID } = await params

        const response = await fetch(
            `${BACKEND_URL}/api/v1/addresses/${addressID}`,
            {
                method: 'DELETE',
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