'use client'

import {
    PaymentElement,
    useElements,
    useStripe
} from '@stripe/react-stripe-js'
import { Button, message } from 'antd'
import { useState } from 'react'

import { getTFunc } from '@/app/utils/helpers'

interface PaymentFormProps {
    onSuccess: () => void
}

export default function PaymentForm({
    onSuccess
}: PaymentFormProps) {
    const stripe = useStripe()
    const elements = useElements()

    const [loading, setLoading] = useState(false)

    const t = getTFunc()
    
    const handleSubmit = async () => {
        if (!stripe || !elements) {
            return
        }

        setLoading(true)

        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            redirect: 'if_required'
        })

        setLoading(false)

        if (error) {
            message.error(error.message)
            return
        }

        if (paymentIntent?.status === 'succeeded') {
            onSuccess()
        } else {
            message.error(t('Payment failed'))
        }
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