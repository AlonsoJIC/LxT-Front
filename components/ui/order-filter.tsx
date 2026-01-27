import React from "react";
import { ChevronDown, ChevronUp, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface SortOption {
  label: string;
  value: string;
}

export interface FilterOption {
  label: string;
  value: string;
}

interface OrderFilterProps {
  sortOptions: SortOption[];
  sortValue: string;
  onSortChange: (value: string) => void;
  filterOptions?: FilterOption[];
  filterValue?: string;
  onFilterChange?: (value: string) => void;
  className?: string;
}

export const OrderFilter: React.FC<OrderFilterProps> = ({
  sortOptions,
  sortValue,
  onSortChange,
  filterOptions = [],
  filterValue = "",
  onFilterChange,
  className = ""
}) => {
  return (
    <div className={cn("flex flex-wrap gap-2 items-center", className)}>
      {/* Ordenar */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Ordenar por:</span>
        <div className="relative">
          <select
            className="appearance-none border border-border rounded-lg px-3 py-2 pr-8 text-sm bg-card text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors min-w-[180px] cursor-pointer"
            value={sortValue}
            onChange={e => onSortChange(e.target.value)}
          >
            {sortOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        </div>
      </div>
      {/* Filtrar */}
      {filterOptions.length > 0 && onFilterChange && (
        <div className="flex items-center gap-1">
          <span className="text-sm text-muted-foreground">Filtrar:</span>
          <select
            className="border rounded px-2 py-1 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
            value={filterValue}
            onChange={e => onFilterChange(e.target.value)}
          >
            <option value="">Todos</option>
            {filterOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <Filter className="w-4 h-4 text-muted-foreground" />
        </div>
      )}
    </div>
  );
};
