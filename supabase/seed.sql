-- Run this after running 00000_initial_schema.sql to populate your dashboard with data.
-- Since this is a test environment, we will temporarily bypass RLS to insert mock data.
SET session_replication_role = 'replica';

-- 1. Create a mock organization
INSERT INTO public.organizations (id, name, industry)
VALUES ('00000000-0000-0000-0000-000000000001', 'Acme Global Corporation', 'Technology')
ON CONFLICT (id) DO NOTHING;

-- 2. (Optional) Link your actual user to this organization. 
-- Find your user ID in auth.users and insert it here, replacing the UUID below.
-- For this seed, we create a dummy user.
INSERT INTO public.users (id, organization_id, full_name, role)
SELECT id, '00000000-0000-0000-0000-000000000001', 'Test User', 'Admin'
FROM auth.users LIMIT 1;

-- If auth.users is empty, we will insert a dummy auth user (if allowed) or just let the tables be without a user_id for now.
-- In Supabase, inserting directly into auth.users is blocked by default via API, but works in SQL Editor.
-- We will just insert audits without created_by for the dashboard.

-- 3. Insert mock Audits
INSERT INTO public.audits (id, organization_id, title, status, description, start_date, end_date)
VALUES 
('a1111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', 'Q3 Financial Controls Audit', 'Fieldwork', 'Review of quarterly financial close processes.', '2023-07-01', '2023-09-30'),
('a2222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000001', 'IT Security & Access Review', 'Planning', 'Annual review of logical access controls.', '2023-10-01', '2023-11-15'),
('a3333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000001', 'Vendor Management Audit', 'Completed', 'Assessment of third-party vendor risks.', '2023-01-15', '2023-03-01')
ON CONFLICT (id) DO NOTHING;

-- 4. Insert mock Risks
INSERT INTO public.risks (id, organization_id, title, category, impact, likelihood, status)
VALUES
('e1111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', 'Unsecured API Endpoints', 'IT', 5, 4, 'Open'),
('e2222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000001', 'Vendor SLA Non-Compliance', 'Operational', 3, 4, 'Mitigated'),
('e3333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000001', 'Inadequate Revenue Recognition', 'Financial', 4, 2, 'Open')
ON CONFLICT (id) DO NOTHING;

-- 5. Insert mock Findings
INSERT INTO public.findings (id, organization_id, audit_id, title, severity, status, due_date)
VALUES
('f1111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', 'a1111111-1111-1111-1111-111111111111', 'Manual Journal Entries lack review', 'High', 'Open', '2023-12-31'),
('f2222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000001', 'a2222222-2222-2222-2222-222222222222', 'Terminated employees retain system access', 'Critical', 'In Remediation', '2023-11-01')
ON CONFLICT (id) DO NOTHING;

-- Restore RLS
SET session_replication_role = 'origin';

-- VERY IMPORTANT: You must link your auth user to this organization for RLS to let you see this data!
-- Execute this after you have registered a user in the UI:
-- UPDATE public.users SET organization_id = '00000000-0000-0000-0000-000000000001';
