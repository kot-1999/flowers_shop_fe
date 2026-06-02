import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL

export async function POST(req: NextRequest) {
    try {
        const response = await fetch(
            `${BACKEND_URL}/api/v1/authorization/logout`,
            {
                method: 'POST',
                headers: {
                    cookie: req.headers.get('cookie') || '',
                },
            }
        );
        console.log('LOGOUT RES',response)

        const data = await response.json();
        const nextResponse = NextResponse.json(data, {
            status: response.status,
        });

        const setCookie = response.headers.get('set-cookie');

        if (setCookie) {
            nextResponse.headers.set('set-cookie', setCookie);
        }

        return nextResponse;
    } catch (error: any) {
        console.log('LOGOUT ERROR',error)
        return NextResponse.json(
            { message: error.message },
            { status: 500 }
        );
    }
}