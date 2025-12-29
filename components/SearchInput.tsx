"use client";

import qs from "query-string";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useDebounce from "@/hooks/useDebounce";
import { Search } from "lucide-react";

const SearchInput = () => {
    const router = useRouter();
    const [value, setValue] = useState<string>("");
    const debouncedValue = useDebounce<string>(value, 500);

    useEffect(() => {
        const query = {
            title: debouncedValue,
        };

        const url = qs.stringifyUrl({
            url: '/search',
            query: query
        });

        router.push(url);
    }, [debouncedValue, router]);

    return (
        <div className="relative mb-6">
            <Search
                size={20}
                className="absolute top-3 left-3 text-neutral-400"
            />
            <input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="What do you want to listen to?"
                className="
                    w-full 
                    bg-neutral-800 
                    text-white
                    rounded-full 
                    pl-10 
                    pr-4 
                    py-2 
                    text-sm 
                    focus:outline-none 
                    focus:ring-2 
                    focus:ring-white/20
                    placeholder:text-neutral-400
                "
            />
        </div>
    );
}

export default SearchInput;
