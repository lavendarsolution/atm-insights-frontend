"use client";

import React, { useEffect } from "react";
import { useMemo, useState } from "react";

import {
  ColumnDef,
  ColumnFiltersState,
  PaginationState,
  Row,
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

export interface KDataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  loading?: boolean;
  initialState?: {
    pagination: PaginationState;
  };
  getRowStyle?: (row: Row<TData>) => React.CSSProperties;
  getRowClassName?: (row: Row<TData>) => string;
  onPaginationChange?: (row: PaginationState) => void;
  hidePagination?: boolean;
  /**
   * Enable row selection
   */
  selectable?: boolean;
  /**
   * Callback when row selection changed
   */
  onSelectionChanged?: (selected: Row<TData>[]) => void;
}

export default function KDataTable<TData, TValue>({
  columns: defaultColumns,
  data,
  initialState,
  getRowStyle,
  getRowClassName,
  loading = false,
  onPaginationChange,
  hidePagination = false,
  selectable = false,
  onSelectionChanged = () => {},
}: KDataTableProps<TData, TValue>) {
  const [pagination, setPagination] = useState<PaginationState>(initialState?.pagination || { pageIndex: 0, pageSize: 10 });
  const columns = useMemo(() => defaultColumns.filter((column) => Boolean(column)), [defaultColumns]);
  const [rowSelection, setRowSelection] = useState({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    initialState: {
      pagination,
      ...initialState,
    },
    state: {
      pagination,
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
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

    onPaginationChange: (newState: any) => {
      setPagination(newState);
    },
  });

  useEffect(() => {
    table.resetRowSelection();
  }, [data, pagination]);

  useEffect(() => {
    onSelectionChanged(table.getSelectedRowModel().rows);
  }, [rowSelection]);

  useEffect(() => {
    if (onPaginationChange) {
      onPaginationChange(pagination);
    }
  }, [pagination]); //eslint-disable-line

  return (
    <div className="space-y-2">
      <div className="overflow-x-auto rounded border">
        <div className="inline-block min-w-full align-middle">
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
                Array.from({ length: table.getState().pagination.pageSize }).map((_, index) => (
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
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    style={getRowStyle ? getRowStyle(row) : {}}
                    className={getRowClassName ? getRowClassName(row) : ""}
                  >
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
      </div>
      {!hidePagination && table.getState().pagination.pageSize < data.length && <KDataTablePagination table={table} />}
    </div>
  );
}
