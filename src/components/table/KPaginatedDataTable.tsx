"use client";

import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";

import {
  ColumnDef,
  ColumnFiltersState,
  type PaginationState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { KDataTablePagination } from "./KDataTablePagination";

interface KDataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  pagination: PaginationState;
  total: number;
  setPagination: Dispatch<SetStateAction<PaginationState>>;
  loading?: boolean;
  option?: {
    topPagination?: boolean;
    pageSizeOptions?: number[];
  };
  /**
   * Enable row selection
   */
  selectable?: boolean;
  /**
   * Callback when row selection changed
   */
  onSelectionChanged?: (selected: number[]) => void;
}

export default function KPaginatedKDataTable<TData, TValue>({
  columns: defaultColumns,
  data,
  pagination,
  total,
  setPagination,
  loading = false,
  option = {
    topPagination: false,
    pageSizeOptions: [10, 20, 30, 50],
  },
  selectable = false,
  onSelectionChanged = () => {},
}: KDataTableProps<TData, TValue>) {
  const columns = useMemo(() => defaultColumns.filter((column) => Boolean(column)), [defaultColumns]);

  const [rowSelection, setRowSelection] = useState({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    manualPagination: true,
    pageCount: Math.ceil(total / pagination.pageSize),
    onPaginationChange: (pagination) => {
      setPagination(pagination);
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  useEffect(() => {
    onSelectionChanged(table.getSelectedRowModel().rows.map((row) => row.index));
  }, [rowSelection]);

  useEffect(() => {
    table.resetRowSelection();
  }, [data, pagination]);

  return (
    <div className="space-y-2">
      {option?.topPagination && <KDataTablePagination table={table} pageSizeOptions={option.pageSizeOptions} />}
      <div className="rounded border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {selectable && (
                  <TableHead className="flex items-center">
                    <input
                      className="h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600"
                      type="checkbox"
                      checked={table.getIsAllRowsSelected() === true ? true : false}
                      onChange={table.getToggleAllRowsSelectedHandler()}
                    />
                  </TableHead>
                )}
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: pagination.pageSize }).map((_, index) => (
                <TableRow key={index}>
                  {selectable && (
                    <TableCell>
                      <Skeleton className="h-8" />
                    </TableCell>
                  )}
                  {table.getVisibleFlatColumns().map((column) => (
                    <TableCell key={column.id}>
                      <Skeleton className="h-8" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {selectable && (
                    <TableCell>
                      <span className="flex h-6 w-6 items-center">
                        <input
                          className="h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600"
                          type="checkbox"
                          checked={row.getIsSelected()}
                          disabled={!row.getCanSelect()}
                          onChange={row.getToggleSelectedHandler()}
                        />
                      </span>
                    </TableCell>
                  )}
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <KDataTablePagination table={table} pageSizeOptions={option.pageSizeOptions} />
    </div>
  );
}
