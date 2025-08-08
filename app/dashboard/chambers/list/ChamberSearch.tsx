"use client";

import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function ChamberSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get("query") || "");
  const [showAll, setShowAll] = useState(
    searchParams.get("showAll") === "true"
  );
  const debouncedValue = useDebounce(value, 500);

  useEffect(() => {
    const createQueryString = (value: string, showAll: boolean) => {
      const params = new URLSearchParams(searchParams);
      if (value) {
        params.set("query", value);
      } else {
        params.delete("query");
      }

      if (showAll) {
        params.set("showAll", "true");
      } else {
        params.delete("showAll");
      }

      return params.toString();
    };

    const queryString = createQueryString(debouncedValue, showAll);
    router.push(`${pathname}?${queryString}`);
  }, [debouncedValue, showAll, pathname, router, searchParams]);

  return (
    <div className="space-y-4">
      <div className="w-full max-w-xl relative">
        <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
        <Input
          type="search"
          placeholder="chambers by doctor, specialization, location..."
          className="h-12 pl-10 text-xs"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      </div>

      {/* <div className="flex items-center gap-2">
        <Button
          variant={showAll ? "default" : "outline"}
          size="sm"
          onClick={() => setShowAll(!showAll)}
        >
          {showAll ? "Show All Chambers" : "Show Verified Only"}
        </Button>

        <div className="flex gap-2">
          <Badge variant="default" className="bg-green-600">
            ✓ Verified - Can Book
          </Badge>
          <Badge variant="destructive">⚠ Unverified - View Only</Badge>
        </div>
      </div> */}
    </div>
  );
}
