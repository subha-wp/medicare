"use client";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";

export function PharmacySearch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get("query") || "");
  const debouncedValue = useDebounce(value, 500);

  useEffect(() => {
    const createQueryString = (value: string) => {
      const params = new URLSearchParams(searchParams);
      if (value) {
        params.set("query", value);
      } else {
        params.delete("query");
      }
      return params.toString();
    };

    const queryString = createQueryString(debouncedValue);
    router.push(`${pathname}?${queryString}`);
  }, [debouncedValue, pathname, router, searchParams]);

  return (
    <div className="w-full max-w-xl relative">
      <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground text-sm" />
      <Input
        type="search"
        placeholder="Search by name or location..."
        className="h-12 pl-10"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </div>
  );
}
