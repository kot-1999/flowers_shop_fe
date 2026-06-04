import { NextRequest, NextResponse } from 'next/server'
import {getRequiredHeaders} from "@/app/utils/serverFunctions";

const BACKEND_URL = process.env.BACKEND_URL

export async function POST(req: NextRequest) {
    try {
        const headers = await getRequiredHeaders(req)

        const response = await fetch(
            `${BACKEND_URL}/api/v1/authorization/logout`,
            {
                method: 'POST',
                headers,
            }
        );

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
        return NextResponse.json(
            { message: error.message },
            { status: 500 }
        );
    }
}