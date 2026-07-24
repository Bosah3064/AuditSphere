-- 00005_financial_engine.sql

-- 1. Create Clients Table (For multi-client audit firms)
CREATE TABLE public.clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    industry TEXT,
    contact_name TEXT,
    contact_email TEXT,
    status TEXT CHECK (status IN ('Active', 'Inactive', 'Archived')) DEFAULT 'Active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Modify Audits table to link to Clients
-- We add client_id to audits so an audit belongs to a client
ALTER TABLE public.audits ADD COLUMN client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL;

-- 3. Create Trial Balances Table
CREATE TABLE public.trial_balances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    audit_id UUID NOT NULL REFERENCES public.audits(id) ON DELETE CASCADE,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    status TEXT CHECK (status IN ('Draft', 'Mapped', 'Finalized')) DEFAULT 'Draft',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Create Accounts Table (Lines in a Trial Balance)
CREATE TABLE public.accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trial_balance_id UUID NOT NULL REFERENCES public.trial_balances(id) ON DELETE CASCADE,
    account_code TEXT NOT NULL,
    account_name TEXT NOT NULL,
    unadjusted_debit NUMERIC(15, 2) DEFAULT 0,
    unadjusted_credit NUMERIC(15, 2) DEFAULT 0,
    adjusted_debit NUMERIC(15, 2) DEFAULT 0,
    adjusted_credit NUMERIC(15, 2) DEFAULT 0,
    final_balance NUMERIC(15, 2) DEFAULT 0,
    lead_schedule TEXT, -- e.g., 'A - Cash', 'B - Accounts Receivable'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. RLS for Clients
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view clients in their org" ON public.clients FOR SELECT USING (organization_id = get_user_org_id());
CREATE POLICY "Users can insert clients in their org" ON public.clients FOR INSERT WITH CHECK (organization_id = get_user_org_id());
CREATE POLICY "Users can update clients in their org" ON public.clients FOR UPDATE USING (organization_id = get_user_org_id());
CREATE POLICY "Users can delete clients in their org" ON public.clients FOR DELETE USING (organization_id = get_user_org_id());

-- 6. RLS for Trial Balances
ALTER TABLE public.trial_balances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view trial balances in their org" ON public.trial_balances FOR SELECT USING (organization_id = get_user_org_id());
CREATE POLICY "Users can insert trial balances in their org" ON public.trial_balances FOR INSERT WITH CHECK (organization_id = get_user_org_id());
CREATE POLICY "Users can update trial balances in their org" ON public.trial_balances FOR UPDATE USING (organization_id = get_user_org_id());
CREATE POLICY "Users can delete trial balances in their org" ON public.trial_balances FOR DELETE USING (organization_id = get_user_org_id());

-- 7. RLS for Accounts
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

-- Note: Accounts don't have organization_id directly, they inherit access through trial_balances.
-- For simplicity in Supabase RLS, we can join or assume if they have the TB, they have the account.
-- A simpler way is to just add organization_id to accounts too. Let's add it for easier RLS.
ALTER TABLE public.accounts ADD COLUMN organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE;

CREATE POLICY "Users can view accounts in their org" ON public.accounts FOR SELECT USING (organization_id = get_user_org_id());
CREATE POLICY "Users can insert accounts in their org" ON public.accounts FOR INSERT WITH CHECK (organization_id = get_user_org_id());
CREATE POLICY "Users can update accounts in their org" ON public.accounts FOR UPDATE USING (organization_id = get_user_org_id());
CREATE POLICY "Users can delete accounts in their org" ON public.accounts FOR DELETE USING (organization_id = get_user_org_id());

-- 8. Triggers for updated_at
CREATE TRIGGER update_clients_modtime BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_trial_balances_modtime BEFORE UPDATE ON public.trial_balances FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_accounts_modtime BEFORE UPDATE ON public.accounts FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 9. Add to Realtime Publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.clients;
ALTER PUBLICATION supabase_realtime ADD TABLE public.trial_balances;
ALTER PUBLICATION supabase_realtime ADD TABLE public.accounts;
