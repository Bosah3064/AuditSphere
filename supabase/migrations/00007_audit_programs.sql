-- 00007_audit_programs.sql
-- Priority 3: Core Business Logic (Audit Programs, Checklists, Evidence)

-- ============================================================
-- 1. AUDIT PROGRAMS (The Checklist Container)
-- ============================================================
CREATE TABLE public.audit_programs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    audit_id UUID NOT NULL REFERENCES public.audits(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT CHECK (status IN ('Not Started', 'In Progress', 'In Review', 'Completed')) DEFAULT 'Not Started',
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 2. AUDIT PROCEDURES (The Individual Checklist Items)
-- ============================================================
CREATE TABLE public.audit_procedures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    program_id UUID NOT NULL REFERENCES public.audit_programs(id) ON DELETE CASCADE,
    step_number INTEGER NOT NULL,
    description TEXT NOT NULL,
    is_mandatory BOOLEAN DEFAULT TRUE,
    status TEXT CHECK (status IN ('Not Started', 'In Progress', 'Passed', 'Failed', 'N/A')) DEFAULT 'Not Started',
    conclusion TEXT,
    tested_by UUID REFERENCES public.users(id),
    tested_at TIMESTAMPTZ,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 3. AUDIT EVIDENCE (Link between Procedures and Workpapers)
-- ============================================================
CREATE TABLE public.audit_evidence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    procedure_id UUID NOT NULL REFERENCES public.audit_procedures(id) ON DELETE CASCADE,
    workpaper_id UUID NOT NULL REFERENCES public.workpapers(id) ON DELETE CASCADE,
    notes TEXT,
    linked_by UUID REFERENCES public.users(id),
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(procedure_id, workpaper_id) -- Prevent duplicate links
);

-- ============================================================
-- 4. TRIGGERS & INDEXES
-- ============================================================
CREATE TRIGGER update_audit_programs_modtime BEFORE UPDATE ON public.audit_programs FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_audit_procedures_modtime BEFORE UPDATE ON public.audit_procedures FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_audit_evidence_modtime BEFORE UPDATE ON public.audit_evidence FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE INDEX idx_programs_audit ON public.audit_programs(audit_id);
CREATE INDEX idx_procedures_program ON public.audit_procedures(program_id);
CREATE INDEX idx_evidence_procedure ON public.audit_evidence(procedure_id);
CREATE INDEX idx_evidence_workpaper ON public.audit_evidence(workpaper_id);

CREATE INDEX idx_programs_org ON public.audit_programs(organization_id);
CREATE INDEX idx_procedures_org ON public.audit_procedures(organization_id);
CREATE INDEX idx_evidence_org ON public.audit_evidence(organization_id);

-- ============================================================
-- 5. ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.audit_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_procedures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_evidence ENABLE ROW LEVEL SECURITY;

-- Programs
CREATE POLICY "Users can view audit programs in their org" ON public.audit_programs FOR SELECT USING (organization_id = get_user_org_id());
CREATE POLICY "Users can insert audit programs in their org" ON public.audit_programs FOR INSERT WITH CHECK (organization_id = get_user_org_id());
CREATE POLICY "Users can update audit programs in their org" ON public.audit_programs FOR UPDATE USING (organization_id = get_user_org_id());

-- Procedures
CREATE POLICY "Users can view audit procedures in their org" ON public.audit_procedures FOR SELECT USING (organization_id = get_user_org_id());
CREATE POLICY "Users can insert audit procedures in their org" ON public.audit_procedures FOR INSERT WITH CHECK (organization_id = get_user_org_id());
CREATE POLICY "Users can update audit procedures in their org" ON public.audit_procedures FOR UPDATE USING (organization_id = get_user_org_id());

-- Evidence
CREATE POLICY "Users can view audit evidence in their org" ON public.audit_evidence FOR SELECT USING (organization_id = get_user_org_id());
CREATE POLICY "Users can insert audit evidence in their org" ON public.audit_evidence FOR INSERT WITH CHECK (organization_id = get_user_org_id());
CREATE POLICY "Users can update audit evidence in their org" ON public.audit_evidence FOR UPDATE USING (organization_id = get_user_org_id());
CREATE POLICY "Users can delete audit evidence in their org" ON public.audit_evidence FOR DELETE USING (organization_id = get_user_org_id());

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.audit_programs, public.audit_procedures, public.audit_evidence;
