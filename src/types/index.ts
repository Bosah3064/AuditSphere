/**
 * AuditSphere — Strict TypeScript Type Definitions
 * 
 * All entity types, enums, and API contracts are defined here.
 * No use of `any` is permitted outside this file.
 */

// ============================================================
// Enums — Status values for all entities
// ============================================================

export enum AuditStatus {
  Planning = "Planning",
  Fieldwork = "Fieldwork",
  Review = "Review",
  Reporting = "Reporting",
  Completed = "Completed",
}

export enum RiskStatus {
  Open = "Open",
  Mitigated = "Mitigated",
  Accepted = "Accepted",
  Closed = "Closed",
}

export enum FindingSeverity {
  Critical = "Critical",
  High = "High",
  Medium = "Medium",
  Low = "Low",
}

export enum FindingStatus {
  Draft = "Draft",
  Open = "Open",
  ManagementResponse = "Management Response",
  InRemediation = "In Remediation",
  Closed = "Closed",
}

export enum ControlType {
  Preventive = "Preventive",
  Detective = "Detective",
  Corrective = "Corrective",
}

export enum ControlFrequency {
  Daily = "Daily",
  Weekly = "Weekly",
  Monthly = "Monthly",
  Quarterly = "Quarterly",
  Annual = "Annual",
  AsNeeded = "As Needed",
}

export enum ControlStatus {
  Effective = "Effective",
  Ineffective = "Ineffective",
  NotTested = "Not Tested",
}

export enum WorkpaperStatus {
  Draft = "Draft",
  InReview = "In Review",
  SignedOff = "Signed Off",
}

export enum ClientStatus {
  Active = "Active",
  Inactive = "Inactive",
  Archived = "Archived",
}

export enum IntegrationStatus {
  Connected = "Connected",
  Disconnected = "Disconnected",
  Error = "Error",
}

export enum IntegrationCategory {
  Financial = "Financial",
  ITSecurity = "IT Security",
  HR = "HR",
  Operations = "Operations",
}

export enum RiskLevel {
  Critical = "Critical",
  High = "High",
  Medium = "Medium",
  Low = "Low",
}

export enum UserRole {
  Admin = "Admin",
  Auditor = "Auditor",
  Reviewer = "Reviewer",
  Viewer = "Viewer",
}

export enum AuditLogAction {
  Insert = "INSERT",
  Update = "UPDATE",
  Delete = "DELETE",
  SoftDelete = "SOFT_DELETE",
  Restore = "RESTORE",
}

export enum TrialBalanceStatus {
  Draft = "Draft",
  Mapped = "Mapped",
  Finalized = "Finalized",
}

export enum ProgramStatus {
  NotStarted = "Not Started",
  InProgress = "In Progress",
  InReview = "In Review",
  Completed = "Completed",
}

export enum ProcedureStatus {
  NotStarted = "Not Started",
  InProgress = "In Progress",
  Passed = "Passed",
  Failed = "Failed",
  NA = "N/A",
}

// ============================================================
// Entity Interfaces
// ============================================================

export interface BaseEntity {
  id: string
  organization_id?: string
  createdAt?: string
  updatedAt?: string
  isDeleted?: boolean
  deletedAt?: string | null
}

export interface Audit extends BaseEntity {
  title: string
  type: string
  status: AuditStatus
  progress: number
  risk: RiskLevel
  startDate: string
  endDate: string
  lead: string
  team: string[]
  clientId?: string
}

export interface Risk extends BaseEntity {
  title: string
  category: string
  impact: number
  likelihood: number
  status: RiskStatus
  owner: string
  description?: string
}

export interface Finding extends BaseEntity {
  auditId: string
  title: string
  severity: FindingSeverity
  status: FindingStatus
  owner: string
  dueDate: string
  description?: string
}

export interface Control extends BaseEntity {
  riskId?: string
  title: string
  description?: string
  type: ControlType
  frequency: ControlFrequency
  status: ControlStatus
  owner: string
}

export interface Workpaper extends BaseEntity {
  auditId: string
  title: string
  content: string
  status: WorkpaperStatus
  preparerId?: string
  reviewerId?: string
}

export interface Client extends BaseEntity {
  name: string
  industry: string
  contactName: string
  contactEmail: string
  status: ClientStatus
}

export interface Integration extends BaseEntity {
  name: string
  provider: string
  category: IntegrationCategory
  status: IntegrationStatus
  lastSync?: string
}

export interface AuditLogEntry {
  id: string
  organization_id?: string
  userId?: string
  action: AuditLogAction
  tableName: string
  recordId: string
  oldData?: Record<string, unknown>
  newData?: Record<string, unknown>
  createdAt: string
}

export interface TrialBalance extends BaseEntity {
  auditId: string
  periodStart: string
  periodEnd: string
  status: TrialBalanceStatus
}

export interface Account {
  id: string
  trialBalanceId: string
  accountCode: string
  accountName: string
  unadjustedDebit: number
  unadjustedCredit: number
  adjustedDebit: number
  adjustedCredit: number
  finalBalance: number
  leadSchedule: string
}

export interface AuditProgram extends BaseEntity {
  auditId: string
  title: string
  description?: string
  status: ProgramStatus
}

export interface AuditProcedure extends BaseEntity {
  programId: string
  stepNumber: number
  description: string
  isMandatory: boolean
  status: ProcedureStatus
  conclusion?: string
  testedBy?: string
  testedAt?: string
}

export interface AuditEvidence extends BaseEntity {
  procedureId: string
  workpaperId: string
  notes?: string
  linkedBy?: string
}

// ============================================================
// Database Row Mappers — snake_case to camelCase
// ============================================================

export interface DbUpdatePayload {
  [key: string]: string | number | boolean | string[] | null | undefined
}

// ============================================================
// API Response Types
// ============================================================

export interface ApiResult<T> {
  data: T | null
  error: string | null
  success: boolean
}

// ============================================================
// AI Safety Constants
// ============================================================

export const AI_DISCLAIMER = 
  "This recommendation is generated using AI and should support—not replace—the professional judgment of qualified auditors. Users remain responsible for all audit conclusions and compliance with applicable auditing standards."

export const AI_SAFETY_RULES = {
  canDo: [
    "Generate drafts",
    "Recommend procedures",
    "Summarize documents",
    "Identify risks",
    "Explain auditing concepts",
    "Suggest controls",
    "Generate working papers",
    "Create audit reports",
    "Highlight missing evidence",
    "Predict possible issues",
  ],
  cannotDo: [
    "Issue legal opinions",
    "Sign audit reports",
    "Replace auditor judgment",
    "Approve engagements",
    "Provide absolute conclusions",
  ],
}
