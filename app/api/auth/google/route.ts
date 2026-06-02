import { NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL

export async function GET() {
    return NextResponse.redirect(
        `${BACKEND_URL}/api/v1/authorization/google`
    )
}