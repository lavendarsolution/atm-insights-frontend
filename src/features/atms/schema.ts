import { z } from "zod";

export const atmStatusEnum = z.enum(["active", "inactive", "warning", "error"]);
export type ATMStatus = z.infer<typeof atmStatusEnum>;

export const regionEnum = z.enum(["AIRPORT", "SUPERMARKET", "MALL", "HOSPITAL", "UNIVERSITY"]);
export type ATMRegion = z.infer<typeof regionEnum>;

export const atmBaseSchema = z.object({
  name: z.string().min(1, "ATM name is required").max(100, "Name too long"),
  location_address: z.string().optional().nullable(),
  region: regionEnum,
  model: z.string().max(50).optional().nullable(),
  manufacturer: z.string().max(50).optional().nullable(),
});

export const atmCreateSchema = atmBaseSchema.extend({
  atm_id: z
    .string()
    .min(1, "ATM ID is required")
    .max(20, "ATM ID too long")
    .regex(/^[A-Z0-9\-_]+$/, "ATM ID must contain only alphanumeric characters, hyphens, and underscores")
    .transform((val) => val.trim().toUpperCase()),
  status: atmStatusEnum.default("active"),
});

export const atmUpdateSchema = z.object({
  name: z.string().min(1, "ATM name cannot be empty").max(100).optional(),
  location_address: z.string().optional().nullable(),
  region: regionEnum.optional(),
  model: z.string().max(50).optional().nullable(),
  manufacturer: z.string().max(50).optional().nullable(),
  status: atmStatusEnum.optional(),
});

export const atmSchema = atmBaseSchema.extend({
  atm_id: z.string(),
  status: atmStatusEnum,
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type ATMBase = z.infer<typeof atmBaseSchema>;
export type ATMCreate = z.infer<typeof atmCreateSchema>;
export type ATMUpdate = z.infer<typeof atmUpdateSchema>;
export type ATM = z.infer<typeof atmSchema>;

export type ATMTelemetry = {
  time: string;
  atm_id: string;
  status: string;
  uptime_seconds?: number;
  cash_level_percent?: number;
  temperature_celsius?: number;
  cpu_usage_percent?: number;
  memory_usage_percent?: number;
  disk_usage_percent?: number;
  network_status?: string;
  network_latency_ms?: number;
  error_code?: string;
  error_message?: string;
};
