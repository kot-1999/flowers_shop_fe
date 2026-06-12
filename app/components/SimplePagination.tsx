'use client'

import {Pagination} from "antd";
import {useRouter, useSearchParams} from "next/navigation";

interface SimplePaginationProps {
    pagination: { current: number; total: number, perPage: number };
}

export default function SimplePagination({pagination}: SimplePaginationProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const key = 'page'

    const onChange = (page: number) => {
        const params = new URLSearchParams(searchParams.toString());

        if (page) {
            params.set(key, String(page))
        } else {
            params.delete(key)
        }

        router.replace(`?${params.toString()}`);
    };
    return (
        <Pagination
            total={pagination.total}
            pageSize={pagination.perPage}
            onChange={onChange}
            current={pagination.current}
            defaultCurrent={1}
            align='center'
            hideOnSinglePage
            showSizeChanger={false}
        />
    );
}