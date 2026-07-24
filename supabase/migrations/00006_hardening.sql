-- 00006_hardening.sql
-- Engineering Standards Compliance: Audit Logs, Soft Deletes, Indexes, RBAC

-- ============================================================
-- 1. AUDIT LOG TABLE
-- Every data mutation across the platform is recorded here.
-- ============================================================
CREATE TABLE public.audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE', 'SOFT_DELETE', 'RESTORE')),
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    old_data JSONB,
    new_data JSONB,
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_log_org ON public.audit_log(organization_id);
CREATE INDEX idx_audit_log_table ON public.audit_log(table_name);
CREATE INDEX idx_audit_log_record ON public.audit_log(record_id);
CREATE INDEX idx_audit_log_created ON public.audit_log(created_at DESC);

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view audit logs in their org"
    ON public.audit_log FOR SELECT
    USING (organization_id = get_user_org_id());

CREATE POLICY "Users can insert audit logs in their org"
    ON public.audit_log FOR INSERT
    WITH CHECK (organization_id = get_user_org_id());

-- ============================================================
-- 2. SOFT DELETES — Add is_deleted + deleted_at to all business tables
-- ============================================================
ALTER TABLE public.audits ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE public.audits ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

ALTER TABLE public.risks ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE public.risks ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

ALTER TABLE public.findings ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE public.findings ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

ALTER TABLE public.controls ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE public.controls ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

ALTER TABLE public.workpapers ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE public.workpapers ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

ALTER TABLE public.integrations ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE public.integrations ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- ============================================================
-- 3. PERFORMANCE INDEXES
-- ============================================================
-- Organization isolation (most-queried filter)
CREATE INDEX IF NOT EXISTS idx_audits_org ON public.audits(organization_id);
CREATE INDEX IF NOT EXISTS idx_risks_org ON public.risks(organization_id);
CREATE INDEX IF NOT EXISTS idx_findings_org ON public.findings(organization_id);
CREATE INDEX IF NOT EXISTS idx_controls_org ON public.controls(organization_id);
CREATE INDEX IF NOT EXISTS idx_workpapers_org ON public.workpapers(organization_id);
CREATE INDEX IF NOT EXISTS idx_clients_org ON public.clients(organization_id);
CREATE INDEX IF NOT EXISTS idx_integrations_org ON public.integrations(organization_id);

-- Status filtering
CREATE INDEX IF NOT EXISTS idx_audits_status ON public.audits(status);
CREATE INDEX IF NOT EXISTS idx_risks_status ON public.risks(status);
CREATE INDEX IF NOT EXISTS idx_findings_status ON public.findings(status);
CREATE INDEX IF NOT EXISTS idx_controls_status ON public.controls(status);

-- Created_at ordering (most common sort)
CREATE INDEX IF NOT EXISTS idx_audits_created ON public.audits(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_risks_created ON public.risks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_findings_created ON public.findings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_clients_name ON public.clients(name);

-- Soft delete filtering
CREATE INDEX IF NOT EXISTS idx_audits_deleted ON public.audits(is_deleted) WHERE is_deleted = FALSE;
CREATE INDEX IF NOT EXISTS idx_risks_deleted ON public.risks(is_deleted) WHERE is_deleted = FALSE;
CREATE INDEX IF NOT EXISTS idx_findings_deleted ON public.findings(is_deleted) WHERE is_deleted = FALSE;

-- ============================================================
-- 4. RBAC — Role permissions table for fine-grained access
-- ============================================================
CREATE TABLE IF NOT EXISTS public.permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role TEXT NOT NULL CHECK (role IN ('Admin', 'Auditor', 'Reviewer', 'Viewer')),
    resource TEXT NOT NULL,
    can_create BOOLEAN DEFAULT FALSE,
    can_read BOOLEAN DEFAULT TRUE,
    can_update BOOLEAN DEFAULT FALSE,
    can_delete BOOLEAN DEFAULT FALSE
);

-- Default permission matrix
INSERT INTO public.permissions (role, resource, can_create, can_read, can_update, can_delete) VALUES
    ('Admin', 'audits', TRUE, TRUE, TRUE, TRUE),
    ('Admin', 'findings', TRUE, TRUE, TRUE, TRUE),
    ('Admin', 'risks', TRUE, TRUE, TRUE, TRUE),
    ('Admin', 'controls', TRUE, TRUE, TRUE, TRUE),
    ('Admin', 'workpapers', TRUE, TRUE, TRUE, TRUE),
    ('Admin', 'clients', TRUE, TRUE, TRUE, TRUE),
    ('Admin', 'settings', TRUE, TRUE, TRUE, TRUE),
    ('Auditor', 'audits', TRUE, TRUE, TRUE, FALSE),
    ('Auditor', 'findings', TRUE, TRUE, TRUE, FALSE),
    ('Auditor', 'risks', TRUE, TRUE, TRUE, FALSE),
    ('Auditor', 'controls', TRUE, TRUE, TRUE, FALSE),
    ('Auditor', 'workpapers', TRUE, TRUE, TRUE, FALSE),
    ('Auditor', 'clients', FALSE, TRUE, FALSE, FALSE),
    ('Auditor', 'settings', FALSE, TRUE, FALSE, FALSE),
    ('Reviewer', 'audits', FALSE, TRUE, TRUE, FALSE),
    ('Reviewer', 'findings', FALSE, TRUE, TRUE, FALSE),
    ('Reviewer', 'risks', FALSE, TRUE, FALSE, FALSE),
    ('Reviewer', 'controls', FALSE, TRUE, FALSE, FALSE),
    ('Reviewer', 'workpapers', FALSE, TRUE, TRUE, FALSE),
    ('Reviewer', 'clients', FALSE, TRUE, FALSE, FALSE),
    ('Reviewer', 'settings', FALSE, TRUE, FALSE, FALSE),
    ('Viewer', 'audits', FALSE, TRUE, FALSE, FALSE),
    ('Viewer', 'findings', FALSE, TRUE, FALSE, FALSE),
    ('Viewer', 'risks', FALSE, TRUE, FALSE, FALSE),
    ('Viewer', 'controls', FALSE, TRUE, FALSE, FALSE),
    ('Viewer', 'workpapers', FALSE, TRUE, FALSE, FALSE),
    ('Viewer', 'clients', FALSE, TRUE, FALSE, FALSE),
    ('Viewer', 'settings', FALSE, TRUE, FALSE, FALSE);

-- ============================================================
-- 5. REALTIME — Add new tables to publication
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.audit_log;
