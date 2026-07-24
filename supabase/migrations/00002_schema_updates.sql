-- 00002_schema_updates.sql
-- Add missing columns to support the sophisticated UI prototype

-- 1. Update Audits Table
ALTER TABLE public.audits 
ADD COLUMN IF NOT EXISTS type TEXT,
ADD COLUMN IF NOT EXISTS progress INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS risk TEXT CHECK (risk IN ('Critical', 'High', 'Medium', 'Low')),
ADD COLUMN IF NOT EXISTS lead TEXT,
ADD COLUMN IF NOT EXISTS team TEXT[];

-- 2. Update Risks Table
ALTER TABLE public.risks
ADD COLUMN IF NOT EXISTS owner TEXT;

-- 3. Update Findings Table
ALTER TABLE public.findings
ADD COLUMN IF NOT EXISTS owner TEXT;
