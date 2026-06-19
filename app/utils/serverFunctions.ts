'use server'

import crypto from 'crypto-js'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

import { CookieKey, Language } from '@/app/utils/enums'

export async function setCookie(key: CookieKey, data: any, maxAge = 60 * 60 * 1) {
    const cookieStore = await cookies()
    cookieStore.set(key, JSON.stringify(data), {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge // 1 hour
    })
}
export async function getCookie(key: CookieKey) {
    const cookieStore = await cookies()
    const cookie = cookieStore.get(key)
    if (cookie?.value) {
        return JSON.parse(cookie.value)
    }

    return null
}

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY as string

/**
 * Generates SHA-256 hash
 */
export async function hashSHA256(value: string): Promise<string> {
    return crypto.SHA256(value).toString()
}

/**
 * Encrypts string using AES
 */
export async function encryptAES(value: string): Promise<string> {
    return crypto.AES.encrypt(value, ENCRYPTION_KEY).toString()
}

/**
 * Decrypts AES encrypted string
 */
export async function decryptAES(value: string): Promise<string> {
    return crypto.AES.decrypt(
        value,
        ENCRYPTION_KEY
    ).toString(crypto.enc.Utf8)
}

export async function getRequiredHeaders(req: NextRequest): Promise<{ 'Content-Type': string, 'Accept-Language': Language, cookie: any }> {
    const settings = await getCookie(CookieKey.Settings)

    return {
        'Content-Type': 'application/json',
        // IMPORTANT: forward app language
        'Accept-Language': settings?.locale ?? Language.en,
        // IMPORTANT: forward session cookie
        cookie: req.headers.get('cookie') ?? ''
    }
}