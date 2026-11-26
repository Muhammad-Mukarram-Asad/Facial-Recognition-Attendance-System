"use client";

import { FilterSelect, ListToolbar, SegmentedControl, type SegmentOption } from "@/shared/ui";

import { SORT_OPTIONS, type RegisterFacets, type RegisterSort } from "../lib/registerView";

interface AttendanceToolbarProps<S extends string> {
  statusOptions: SegmentOption[];
  status: S;
  onStatusChange: (status: S) => void;
  departments: string[];
  designations: string[];
  facets: RegisterFacets;
  onFacetsChange: (facets: RegisterFacets) => void;
  sort: RegisterSort;
  onSortChange: (sort: RegisterSort) => void;
  onClear: () => void;
}

/** Status tabs on the left; department, designation and sort on the right. */
export function AttendanceToolbar<S extends string>({
  statusOptions,
  status,
  onStatusChange,
  departments,
  designations,
  facets,
  onFacetsChange,
  sort,
  onSortChange,
  onClear,
}: AttendanceToolbarProps<S>) {
  return (
    <ListToolbar
      tabs={
        <SegmentedControl
          size="sm"
          ariaLabel="Filter attendance by status"
          options={statusOptions}
          value={status}
          onChange={(value) => onStatusChange(value as S)}
        />
      }
      onClear={facets.department || facets.designation ? onClear : undefined}
    >
      <FilterSelect
        icon="building"
        label="Department"
        allLabel="All departments"
        options={departments}
        value={facets.department}
        onChange={(department) => onFacetsChange({ ...facets, department })}
      />
      <FilterSelect
        icon="briefcase"
        label="Designation"
        allLabel="All designations"
        options={designations}
        value={facets.designation}
        onChange={(designation) => onFacetsChange({ ...facets, designation })}
      />
      <FilterSelect
        icon="arrow-up-down"
        label="Sort by"
        options={SORT_OPTIONS}
        value={sort}
        onChange={(value) => onSortChange(value as RegisterSort)}
      />
    </ListToolbar>
  );
}
