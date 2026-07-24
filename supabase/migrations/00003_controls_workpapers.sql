-- 00003_controls_workpapers.sql

-- 1. Create Controls Table
CREATE TABLE public.controls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    risk_id UUID REFERENCES public.risks(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT CHECK (type IN ('Preventive', 'Detective', 'Corrective')),
    frequency TEXT CHECK (frequency IN ('Daily', 'Weekly', 'Monthly', 'Quarterly', 'Annual', 'As Needed')),
    status TEXT CHECK (status IN ('Effective', 'Ineffective', 'Not Tested')) DEFAULT 'Not Tested',
    owner TEXT,
    owner_id UUID REFERENCES public.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Create Workpapers Table
CREATE TABLE public.workpapers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    audit_id UUID NOT NULL REFERENCES public.audits(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT,
    status TEXT CHECK (status IN ('Draft', 'In Review', 'Signed Off')) DEFAULT 'Draft',
    preparer_id UUID REFERENCES public.users(id),
    reviewer_id UUID REFERENCES public.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. RLS for Controls
ALTER TABLE public.controls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view controls in their org"
    ON public.controls FOR SELECT
    USING (organization_id = get_user_org_id());

CREATE POLICY "Users can insert controls in their org"
    ON public.controls FOR INSERT
    WITH CHECK (organization_id = get_user_org_id());

CREATE POLICY "Users can update controls in their org"
    ON public.controls FOR UPDATE
    USING (organization_id = get_user_org_id());

CREATE POLICY "Users can delete controls in their org"
    ON public.controls FOR DELETE
    USING (organization_id = get_user_org_id());

-- 4. RLS for Workpapers
ALTER TABLE public.workpapers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view workpapers in their org"
    ON public.workpapers FOR SELECT
    USING (organization_id = get_user_org_id());

CREATE POLICY "Users can insert workpapers in their org"
    ON public.workpapers FOR INSERT
    WITH CHECK (organization_id = get_user_org_id());

CREATE POLICY "Users can update workpapers in their org"
    ON public.workpapers FOR UPDATE
    USING (organization_id = get_user_org_id());

CREATE POLICY "Users can delete workpapers in their org"
    ON public.workpapers FOR DELETE
    USING (organization_id = get_user_org_id());

-- 5. Triggers for updated_at
CREATE TRIGGER update_controls_modtime BEFORE UPDATE ON public.controls FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_workpapers_modtime BEFORE UPDATE ON public.workpapers FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 6. Add to Realtime Publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.controls;
ALTER PUBLICATION supabase_realtime ADD TABLE public.workpapers;
