"use client";

import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, MapPin, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function ChamberSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get("query") || "");
  const debouncedValue = useDebounce(value, 300); // Faster debounce for better UX

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
    <div className="space-y-4">
      <div className="w-full max-w-xl relative">
        <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search by doctor, specialization, or location..."
          className="h-12 pl-10 text-xs"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      </div>
    </div>
  );
}
