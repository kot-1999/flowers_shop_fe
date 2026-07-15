'use client'

import {
    Spin
} from 'antd'
import { useEffect, useState } from 'react'

import OrderList from '@/app/components/order/OrdersList'
import OrdersSearch from '@/app/components/order/OrdersSearch'
import SimplePagination from '@/app/components/SimplePagination'
import { fetchOrders } from '@/app/utils/clientFetchFuntions'
import { Defaults, LocalStorageKey } from '@/app/utils/enums'
import { getTFunc } from '@/app/utils/helpers'

export default function Orders() {
    const t = getTFunc()

    const [ordersData, setOrders] = useState<{
        orders: any[]
        pagination: any
    }>({
        orders: [],
        pagination: {}
    })

    const [loading, setLoading] = useState(false)
    const [options, setOptions] = useState({
        search: '',
        states: [],
        sortBy: 'createdAt',
        sortOrder: 'desc'
    })
    
    useEffect(() => {
        fetchOrders(ordersData, setLoading, options, setOrders, t)
    }, [])

    const handleSearch = () => {
        fetchOrders(ordersData, setLoading, options, setOrders, t)
    }

    return (
        <div style={{ padding: 24 }}>
            <h1>{t('Orders')}</h1>

            <OrdersSearch handleSearch={handleSearch} options={options} setOptions={setOptions} t={t}/>

            {loading ? (
                <Spin />
            ) : (
                <>
                    <OrderList orders={ordersData?.orders ?? []} t={t}/>

                    <SimplePagination
                        storageKey={LocalStorageKey.OrdersPagination}
                        current={ordersData.pagination?.page ?? Defaults.Page}
                        total={ordersData.pagination?.total ?? 0}
                        pageSize={ordersData.pagination?.limit ?? Defaults.Limit}
                        callFunc={handleSearch}
                    />
                </>
            )}
        </div>
    )
}