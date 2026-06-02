import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL;

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ userID: string }> }
) {
    try {
        const { userID } = await params;

        const response = await fetch(
            `${BACKEND_URL}/api/v1/user/${userID}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    cookie: req.headers.get('cookie') || '',
                },
            }
        );

        const data = await response.json();
        return NextResponse.json(data, {
            status: response.status,
        });
    } catch (error: any) {
        return NextResponse.json(
            { message: error.message },
            { status: 500 }
        );
    }
}

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ userID: string }> }
) {
    try {
        const { userID } = await params;
        const body = await req.json();

        const response = await fetch(
            `${BACKEND_URL}/api/v1/user/${userID}`,
            {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    cookie: req.headers.get('cookie') || '',
                },
                body: JSON.stringify(body),
            }
        );

        const data = await response.json();

        return NextResponse.json(data, {
            status: response.status,
        });
    } catch (error: any) {
        return NextResponse.json(
            { message: error.message },
            { status: 500 }
        );
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ userID: string }> }
) {
    try {
        const { userID } = await params;

        const response = await fetch(
            `${BACKEND_URL}/api/v1/user/${userID}`,
            {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    cookie: req.headers.get('cookie') || '',
                },
            }
        );

        const data = await response.json();

        const nextResponse = NextResponse.json(data, {
            status: response.status,
        });

        // Clear session cookie on delete
        if (response.ok) {
            nextResponse.headers.set(
                'set-cookie',
                'connect.sid=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 UTC; HttpOnly; SameSite=Strict'
            );
        }

        return nextResponse;
    } catch (error: any) {
        return NextResponse.json(
            { message: error.message },
            { status: 500 }
        );
    }
}