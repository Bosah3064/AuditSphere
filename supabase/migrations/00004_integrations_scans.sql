-- 00004_integrations_scans.sql

-- 1. Create Integrations Table
CREATE TABLE public.integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- e.g., 'Xero', 'QuickBooks', 'AWS Security Hub'
    provider TEXT NOT NULL, -- e.g., 'xero', 'quickbooks', 'aws'
    category TEXT NOT NULL, -- e.g., 'Financial', 'IT Security', 'HR'
    status TEXT CHECK (status IN ('Connected', 'Disconnected', 'Error')) DEFAULT 'Disconnected',
    last_sync TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Create Scans Table (History of automated scans)
CREATE TABLE public.scans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    integration_id UUID NOT NULL REFERENCES public.integrations(id) ON DELETE CASCADE,
    status TEXT CHECK (status IN ('Running', 'Completed', 'Failed')) DEFAULT 'Running',
    findings_count INTEGER DEFAULT 0,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- 3. RLS for Integrations
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view integrations in their org"
    ON public.integrations FOR SELECT
    USING (organization_id = get_user_org_id());

CREATE POLICY "Users can update integrations in their org"
    ON public.integrations FOR UPDATE
    USING (organization_id = get_user_org_id());
    
CREATE POLICY "Users can insert integrations in their org"
    ON public.integrations FOR INSERT
    WITH CHECK (organization_id = get_user_org_id());

-- 4. RLS for Scans
ALTER TABLE public.scans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view scans in their org"
    ON public.scans FOR SELECT
    USING (organization_id = get_user_org_id());

CREATE POLICY "Users can insert scans in their org"
    ON public.scans FOR INSERT
    WITH CHECK (organization_id = get_user_org_id());
    
CREATE POLICY "Users can update scans in their org"
    ON public.scans FOR UPDATE
    USING (organization_id = get_user_org_id());

-- 5. Triggers for updated_at
CREATE TRIGGER update_integrations_modtime BEFORE UPDATE ON public.integrations FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 6. Add to Realtime Publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.integrations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.scans;
