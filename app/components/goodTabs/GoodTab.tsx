'use client'

import {useState} from "react";
import {Table} from "antd";
import SimplePagination from "@/app/components/SimplePagination";

export default function GoodTab() {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);



    return (
        <>
            <h1>GoodTab</h1>
        </>
    );
}