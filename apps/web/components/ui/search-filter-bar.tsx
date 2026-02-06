"use client";

import { useState, useCallback, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, X, Filter, SlidersHorizontal } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

export interface FilterConfig {
  id: string;
  label: string;
  type: "select" | "multiselect" | "range" | "text";
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
}

export interface ActiveFilter {
  id: string;
  value: string | string[] | [number, number];
  label: string;
}

interface SearchFilterBarProps {
  placeholder?: string;
  filters?: FilterConfig[];
  onSearch: (query: string) => void;
  onFilterChange: (filters: ActiveFilter[]) => void;
  debounceMs?: number;
}

export function SearchFilterBar({
  placeholder = "Search...",
  filters = [],
  onSearch,
  onFilterChange,
  debounceMs = 300,
}: SearchFilterBarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(searchQuery);
    }, debounceMs);
    return () => clearTimeout(timer);
  }, [searchQuery, debounceMs, onSearch]);

  // Notify parent of filter changes
  useEffect(() => {
    onFilterChange(activeFilters);
  }, [activeFilters, onFilterChange]);

  const addFilter = useCallback((filter: ActiveFilter) => {
    setActiveFilters((prev) => {
      const existing = prev.findIndex((f) => f.id === filter.id);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = filter;
        return updated;
      }
      return [...prev, filter];
    });
  }, []);

  const removeFilter = useCallback((filterId: string) => {
    setActiveFilters((prev) => prev.filter((f) => f.id !== filterId));
  }, []);

  const clearAllFilters = useCallback(() => {
    setActiveFilters([]);
    setSearchQuery("");
  }, []);

  return (
    <div className="space-y-3">
      {/* Search and Filter Row */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={placeholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-9"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {filters.length > 0 && (
          <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                Filters
                {activeFilters.length > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {activeFilters.length}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Filters</h4>
                  {activeFilters.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAllFilters}
                      className="h-auto p-0 text-muted-foreground"
                    >
                      Clear all
                    </Button>
                  )}
                </div>

                {filters.map((filter) => (
                  <div key={filter.id} className="space-y-2">
                    <Label>{filter.label}</Label>
                    {filter.type === "select" && filter.options && (
                      <Select
                        value={
                          (activeFilters.find((f) => f.id === filter.id)
                            ?.value as string) || ""
                        }
                        onValueChange={(value) => {
                          if (value) {
                            const option = filter.options?.find(
                              (o) => o.value === value,
                            );
                            addFilter({
                              id: filter.id,
                              value,
                              label: `${filter.label}: ${option?.label || value}`,
                            });
                          } else {
                            removeFilter(filter.id);
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={`Select ${filter.label.toLowerCase()}`}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All</SelectItem>
                          {filter.options.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}

                    {filter.type === "range" && (
                      <div className="pt-2">
                        <Slider
                          min={filter.min || 0}
                          max={filter.max || 100}
                          step={1}
                          value={[
                            (
                              activeFilters.find((f) => f.id === filter.id)
                                ?.value as [number, number]
                            )?.[0] ||
                              filter.min ||
                              0,
                            (
                              activeFilters.find((f) => f.id === filter.id)
                                ?.value as [number, number]
                            )?.[1] ||
                              filter.max ||
                              100,
                          ]}
                          onValueChange={([min, max]) => {
                            addFilter({
                              id: filter.id,
                              value: [min, max],
                              label: `${filter.label}: ${min}-${max}`,
                            });
                          }}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>{filter.min || 0}</span>
                          <span>{filter.max || 100}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {activeFilters.map((filter) => (
            <Badge key={filter.id} variant="secondary" className="gap-1">
              {filter.label}
              <button
                onClick={() => removeFilter(filter.id)}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="h-6 text-xs"
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
}

// Predefined filter configurations for common use cases
export const LEAD_FILTERS: FilterConfig[] = [
  {
    id: "status",
    label: "Status",
    type: "select",
    options: [
      { value: "new", label: "New" },
      { value: "qualified", label: "Qualified" },
      { value: "contacted", label: "Contacted" },
      { value: "pre-onboarding", label: "Pre-Onboarding" },
      { value: "onboarding", label: "Onboarding" },
      { value: "active", label: "Active" },
      { value: "churned", label: "Churned" },
    ],
  },
  {
    id: "industry",
    label: "Industry",
    type: "select",
    options: [
      { value: "restaurant", label: "Restaurant" },
      { value: "healthcare", label: "Healthcare" },
      { value: "legal", label: "Legal Services" },
      { value: "automotive", label: "Automotive" },
      { value: "fitness", label: "Health & Fitness" },
      { value: "construction", label: "Construction" },
      { value: "retail", label: "Retail" },
      { value: "real-estate", label: "Real Estate" },
    ],
  },
  {
    id: "aiScore",
    label: "AI Score",
    type: "range",
    min: 0,
    max: 100,
  },
  {
    id: "yearsInBusiness",
    label: "Years in Business",
    type: "range",
    min: 0,
    max: 50,
  },
];

export const CAMPAIGN_FILTERS: FilterConfig[] = [
  {
    id: "status",
    label: "Status",
    type: "select",
    options: [
      { value: "draft", label: "Draft" },
      { value: "active", label: "Active" },
      { value: "paused", label: "Paused" },
      { value: "completed", label: "Completed" },
    ],
  },
  {
    id: "type",
    label: "Type",
    type: "select",
    options: [
      { value: "email", label: "Email" },
      { value: "linkedin", label: "LinkedIn" },
      { value: "multi-channel", label: "Multi-Channel" },
    ],
  },
];

export const CONTACT_FILTERS: FilterConfig[] = [
  {
    id: "seniority",
    label: "Seniority",
    type: "select",
    options: [
      { value: "c-level", label: "C-Level" },
      { value: "vp", label: "VP" },
      { value: "director", label: "Director" },
      { value: "manager", label: "Manager" },
      { value: "staff", label: "Staff" },
    ],
  },
  {
    id: "hasEmail",
    label: "Has Email",
    type: "select",
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
    ],
  },
];
