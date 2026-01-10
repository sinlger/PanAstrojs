import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

const sortOptions = [
  {
    value: "created",
    label: "最新入库",
  },
  {
    value: "updated",
    label: "最近更新",
  }
]

interface SearchSortProps {
  initialSort?: string;
}

export function SearchSort({ initialSort = "default" }: SearchSortProps) {
  const [open, setOpen] = React.useState(false)
  const [sort, setSort] = React.useState(initialSort)

  const handleSelect = (currentValue: string) => {
    const newValue = currentValue === sort ? "" : currentValue;
    if (!newValue) return; // Don't allow deselecting to empty

    setSort(newValue);
    setOpen(false);

    // Update URL
    const params = new URLSearchParams(window.location.search);
    if (newValue === "default") {
      params.delete("sort");
    } else {
      params.set("sort", newValue);
    }
    // Reset page to 1
    params.set("page", "1");
    
    window.location.href = `${window.location.pathname}?${params.toString()}`;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {sort
            ? sortOptions.find((option) => option.value === sort)?.label
            : "排序方式..."}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandList>
            <CommandEmpty>No option found.</CommandEmpty>
            <CommandGroup>
              {sortOptions.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={handleSelect}
                >
                  {option.label}
                  <Check
                    className={cn(
                      "ml-auto",
                      sort === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
