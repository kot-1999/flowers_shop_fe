'use client'

import {
    PaymentElement,
    useElements,
    useStripe
} from '@stripe/react-stripe-js'
import { Button, message } from 'antd'
import { useState } from 'react'

export default function PaymentForm() {
    const stripe = useStripe()
    const elements = useElements()

    const [loading, setLoading] = useState(false)

    const handleSubmit = async () => {
        if (!stripe || !elements) {
            return
        }

        setLoading(true)

        const { error } = await stripe.confirmPayment({
            elements,
            redirect: 'if_required'
        })

        setLoading(false)

        if (error) {
            message.error(error.message)
            return
        }

        message.success('Payment successful')
    }

    return (
        <>
            <PaymentElement
                options={{
                    wallets: {
                        googlePay: 'auto',
                        applePay: 'auto'
                    }
                }}
            />

            <Button
                loading={loading}
                type="primary"
                onClick={handleSubmit}
                style={{ marginTop: 24 }}
            >
                Pay
            </Button>
        </>
    )
}