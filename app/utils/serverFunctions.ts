'use server'

import { cookies } from "next/headers";
import crypto from 'crypto-js'

type Key = 'user'

export async function setCookie(key: Key, data: any) {
    const cookieStore = await cookies();
    cookieStore.set(key, JSON.stringify(data), {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 1, // 1 hour
    });
}
export async function getCookie(key: Key) {
    const cookieStore = await cookies();
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