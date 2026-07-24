-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create tables
CREATE TABLE public.organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    industry TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT CHECK (role IN ('Admin', 'Auditor', 'Reviewer', 'Viewer')) DEFAULT 'Viewer',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.audits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    status TEXT CHECK (status IN ('Planning', 'Fieldwork', 'Review', 'Completed')) DEFAULT 'Planning',
    description TEXT,
    start_date DATE,
    end_date DATE,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.risks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    impact INTEGER CHECK (impact BETWEEN 1 AND 5),
    likelihood INTEGER CHECK (likelihood BETWEEN 1 AND 5),
    status TEXT CHECK (status IN ('Open', 'Mitigated', 'Accepted', 'Closed')) DEFAULT 'Open',
    owner_id UUID REFERENCES public.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.findings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    audit_id UUID NOT NULL REFERENCES public.audits(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    severity TEXT CHECK (severity IN ('Low', 'Medium', 'High', 'Critical')),
    status TEXT CHECK (status IN ('Draft', 'Open', 'Management Response', 'In Remediation', 'Closed')) DEFAULT 'Draft',
    owner_id UUID REFERENCES public.users(id),
    due_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Setup Row Level Security (RLS)
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.findings ENABLE ROW LEVEL SECURITY;

-- Helper function to get the current user's organization_id
CREATE OR REPLACE FUNCTION get_user_org_id()
RETURNS UUID
LANGUAGE sql SECURITY DEFINER
SET search_path = public
AS $$
  SELECT organization_id FROM public.users WHERE id = auth.uid() LIMIT 1;
$$;

-- RLS Policies for users
CREATE POLICY "Users can view their own profile and members of their org"
    ON public.users FOR SELECT
    USING (id = auth.uid() OR organization_id = get_user_org_id());

CREATE POLICY "Users can update their own profile"
    ON public.users FOR UPDATE
    USING (id = auth.uid());

-- RLS Policies for organizations
CREATE POLICY "Users can view their own organization"
    ON public.organizations FOR SELECT
    USING (id = get_user_org_id());

-- RLS Policies for audits
CREATE POLICY "Users can view audits in their org"
    ON public.audits FOR SELECT
    USING (organization_id = get_user_org_id());

CREATE POLICY "Users can insert audits in their org"
    ON public.audits FOR INSERT
    WITH CHECK (organization_id = get_user_org_id());

CREATE POLICY "Users can update audits in their org"
    ON public.audits FOR UPDATE
    USING (organization_id = get_user_org_id());

-- RLS Policies for risks
CREATE POLICY "Users can view risks in their org"
    ON public.risks FOR SELECT
    USING (organization_id = get_user_org_id());

CREATE POLICY "Users can insert risks in their org"
    ON public.risks FOR INSERT
    WITH CHECK (organization_id = get_user_org_id());

CREATE POLICY "Users can update risks in their org"
    ON public.risks FOR UPDATE
    USING (organization_id = get_user_org_id());

-- RLS Policies for findings
CREATE POLICY "Users can view findings in their org"
    ON public.findings FOR SELECT
    USING (organization_id = get_user_org_id());

CREATE POLICY "Users can insert findings in their org"
    ON public.findings FOR INSERT
    WITH CHECK (organization_id = get_user_org_id());

CREATE POLICY "Users can update findings in their org"
    ON public.findings FOR UPDATE
    USING (organization_id = get_user_org_id());

-- 4. Enable Realtime capabilities
-- We need to add tables to the publication 'supabase_realtime' to enable streaming
DROP PUBLICATION IF EXISTS supabase_realtime;
CREATE PUBLICATION supabase_realtime FOR TABLE 
    public.audits, 
    public.risks, 
    public.findings, 
    public.users;

-- 5. Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_organizations_modtime BEFORE UPDATE ON public.organizations FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_users_modtime BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_audits_modtime BEFORE UPDATE ON public.audits FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_risks_modtime BEFORE UPDATE ON public.risks FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_findings_modtime BEFORE UPDATE ON public.findings FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
