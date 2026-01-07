import * as React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface NetdiskType {
  id: number;
  name: string;
  code: string;
}

interface Category {
  id: number;
  name: string;
}

interface SearchFiltersProps {
  netdiskTypes: NetdiskType[];
  categories: Category[];
  initialSources?: string[];
  initialCategory?: string;
}

export function SearchFilters({
  netdiskTypes,
  categories,
  initialSources = [],
  initialCategory = "all",
}: SearchFiltersProps) {
  const [selectedSources, setSelectedSources] = React.useState<string[]>(initialSources);
  const [selectedCategory, setSelectedCategory] = React.useState<string>(initialCategory || "all");

  const handleSourceChange = (code: string, checked: boolean) => {
    let newSources = [...selectedSources];
    if (code === "all") {
      newSources = [];
    } else {
      if (checked) {
        newSources.push(code);
      } else {
        newSources = newSources.filter((s) => s !== code);
      }
    }
    setSelectedSources(newSources);
    updateUrl(newSources, selectedCategory);
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    updateUrl(selectedSources, value);
  };

  const updateUrl = (sources: string[], category: string) => {
    const params = new URLSearchParams(window.location.search);
    if (sources.length > 0) {
      params.set("source", sources.join(","));
    } else {
      params.delete("source");
    }

    if (category && category !== "all") {
      params.set("category", category);
    } else {
      params.delete("category");
    }
    
    // Reset page to 1 when filter changes
    params.set("page", "1");

    window.location.href = `${window.location.pathname}?${params.toString()}`;
  };

  return (
    <div className="space-y-8">
      {/* 网盘来源 */}
      <div>
        <h3 className="text-sm font-bold text-slate-900 mb-4">网盘来源</h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="source-all"
              checked={selectedSources.length === 0}
              onCheckedChange={(checked) => handleSourceChange("all", checked === true)}
            />
            <Label htmlFor="source-all" className="text-sm font-medium text-slate-600 cursor-pointer">
              全部来源
            </Label>
          </div>
          {netdiskTypes.map((type) => (
            <div key={type.id} className="flex items-center space-x-2">
              <Checkbox
                id={`source-${type.code}`}
                checked={selectedSources.includes(type.code)}
                onCheckedChange={(checked) =>
                  handleSourceChange(type.code, checked === true)
                }
              />
              <Label
                htmlFor={`source-${type.code}`}
                className="text-sm font-medium text-slate-600 cursor-pointer"
              >
                {type.name}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* 资源类型 */}
      <div>
        <h3 className="text-sm font-bold text-slate-900 mb-4">资源类型</h3>
        <RadioGroup
          value={selectedCategory}
          onValueChange={handleCategoryChange}
          className="space-y-3"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="all" id="cat-all" />
            <Label htmlFor="cat-all" className="text-sm font-medium text-slate-600 cursor-pointer">
              全部资源
            </Label>
          </div>
          {categories.map((cat) => (
            <div key={cat.id} className="flex items-center space-x-2">
              <RadioGroupItem value={String(cat.id)} id={`cat-${cat.id}`} />
              <Label
                htmlFor={`cat-${cat.id}`}
                className="text-sm font-medium text-slate-600 cursor-pointer"
              >
                {cat.name}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>
    </div>
  );
}
