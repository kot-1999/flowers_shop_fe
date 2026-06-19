import { NextRequest, NextResponse } from 'next/server'

import { getRequiredHeaders } from '@/app/utils/serverFunctions'

const BACKEND_URL = process.env.BACKEND_URL

export async function POST(req: NextRequest) {
    try {
        const headers = await getRequiredHeaders(req)

        const formData = await req.formData()
        const files = formData.getAll('files') as File[]

        const presignResponse = await fetch(
            `${BACKEND_URL}/api/v1/files/upload`,
            {
                method: 'PUT',
                headers: {
                    ...headers
                },
                body: JSON.stringify({
                    files: files.map((file) => ({
                        filename: file.name,
                        contentType: file.type
                    }))
                })
            }
        )

        const uploads: any = await presignResponse.json()

        await Promise.all(files.map((file, index) =>
            fetch(uploads.files[index].uploadUrl, {
                method: 'PUT',
                headers: {
                    'Content-Type': file.type
                },
                body: file
            })))

        return NextResponse.json(
            uploads,
            { status: 200 }
        )
    } catch (error: any) {
        return NextResponse.json(
            { message: error.message },
            { status: 500 }
        )
    }
}