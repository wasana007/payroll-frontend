// src/types/payroll.ts
export type Status = "COMPLETED" | "PENDING" | "FAILED";

export interface PayrollResult {
  employeeId: string;
  salary: number | string;
  tax: number | string;
  month: string;
  completedAt: string;
  status: Status;
  error?: string;
}

export interface HistoryItem {
  employeeId: string;
  salary: number | string;
  tax: number | string;
  month: string;
  status: Status;
  correlationId: string;
  tid: string;
}