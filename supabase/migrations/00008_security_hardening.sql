-- 00008_security_hardening.sql
-- Security Hardening: Role Escalation Protection, Delete Restrictions, Audit Logs, and Signed-Off Locks

-- ============================================================
-- 1. SECURE THE ROLES FIELD (Prevent self-escalation on users table)
-- ============================================================
CREATE OR REPLACE FUNCTION public.prevent_role_self_escalation()
RETURNS TRIGGER AS $$
BEGIN
    -- If role is changing, verify that the active executing user is an 'Admin'
    IF NEW.role <> OLD.role AND (
        NOT EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role = 'Admin'
        )
    ) THEN
        RAISE EXCEPTION 'Access Denied: Only users with the Admin role can modify user roles.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER trg_prevent_role_escalation
BEFORE UPDATE ON public.users
FOR EACH ROW EXECUTE FUNCTION public.prevent_role_self_escalation();

-- ============================================================
-- 2. HARDEN DELETE POLICIES ACROSS CRITICAL TABLES
-- ============================================================

-- Workpapers: Delete allowed if in-org and status is not Signed Off
DROP POLICY IF EXISTS "Users can delete workpapers in their org" ON public.workpapers;
CREATE POLICY "Users can delete workpapers in their org if not signed off"
ON public.workpapers FOR DELETE
USING (
  (organization_id = get_user_org_id()) AND 
  (status <> 'Signed Off')
);

-- Audits: Delete allowed if in-org and status is not Completed
DROP POLICY IF EXISTS "Users can delete audits in their org" ON public.audits;
CREATE POLICY "Users can delete audits in their org if not completed"
ON public.audits FOR DELETE
USING (
  (organization_id = get_user_org_id()) AND 
  (status <> 'Completed')
);

-- Findings: Delete allowed if in-org and status is not Closed
DROP POLICY IF EXISTS "Users can delete findings in their org" ON public.findings;
CREATE POLICY "Users can delete findings in their org if not closed"
ON public.findings FOR DELETE
USING (
  (organization_id = get_user_org_id()) AND 
  (status <> 'Closed')
);

-- Controls: Delete allowed if in-org
DROP POLICY IF EXISTS "Users can delete controls in their org" ON public.controls;
CREATE POLICY "Users can delete controls in their org"
ON public.controls FOR DELETE
USING (
  organization_id = get_user_org_id()
);

-- Risks: Delete allowed if in-org and status is not Closed
DROP POLICY IF EXISTS "Users can delete risks in their org" ON public.risks;
CREATE POLICY "Users can delete risks in their org if not closed"
ON public.risks FOR DELETE
USING (
  (organization_id = get_user_org_id()) AND 
  (status <> 'Closed')
);

-- ============================================================
-- 3. AUTOMATIC DATABASE MUTATION AUDIT LOGGING
-- ============================================================
CREATE OR REPLACE FUNCTION public.log_database_mutation()
RETURNS TRIGGER AS $$
DECLARE
    v_user_id UUID;
    v_org_id UUID;
BEGIN
    v_user_id := auth.uid();
    v_org_id := public.get_user_org_id();

    -- Fallback to the record's organization if get_user_org_id() is null (e.g. system or seed updates)
    IF v_org_id IS NULL THEN
        IF TG_OP = 'DELETE' THEN
            v_org_id := OLD.organization_id;
        ELSE
            v_org_id := NEW.organization_id;
        END IF;
    END IF;

    INSERT INTO public.audit_log (
        user_id,
        organization_id,
        action,
        table_name,
        record_id,
        old_data,
        new_data,
        created_at
    ) VALUES (
        v_user_id,
        v_org_id,
        TG_OP,
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN row_to_json(OLD)::jsonb ELSE NULL END,
        CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW)::jsonb ELSE NULL END,
        NOW()
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach triggers to capture INSERT, UPDATE, and DELETE operations
CREATE OR REPLACE TRIGGER trg_log_workpapers_mutation
AFTER INSERT OR UPDATE OR DELETE ON public.workpapers
FOR EACH ROW EXECUTE FUNCTION public.log_database_mutation();

CREATE OR REPLACE TRIGGER trg_log_audits_mutation
AFTER INSERT OR UPDATE OR DELETE ON public.audits
FOR EACH ROW EXECUTE FUNCTION public.log_database_mutation();

CREATE OR REPLACE TRIGGER trg_log_findings_mutation
AFTER INSERT OR UPDATE OR DELETE ON public.findings
FOR EACH ROW EXECUTE FUNCTION public.log_database_mutation();

CREATE OR REPLACE TRIGGER trg_log_risks_mutation
AFTER INSERT OR UPDATE OR DELETE ON public.risks
FOR EACH ROW EXECUTE FUNCTION public.log_database_mutation();

CREATE OR REPLACE TRIGGER trg_log_controls_mutation
AFTER INSERT OR UPDATE OR DELETE ON public.controls
FOR EACH ROW EXECUTE FUNCTION public.log_database_mutation();

-- ============================================================
-- 4. WORKPAPER LOCK ENFORCEMENT (Compliance Lock)
-- ============================================================
CREATE OR REPLACE FUNCTION public.enforce_workpaper_lock()
RETURNS TRIGGER AS $$
BEGIN
    -- If the workpaper was already signed off, block any changes or deletion
    IF OLD.status = 'Signed Off' THEN
        RAISE EXCEPTION 'Compliance Error: This workpaper has been signed off and is locked against all modifications.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER trg_protect_signed_off_workpapers
BEFORE UPDATE OR DELETE ON public.workpapers
FOR EACH ROW EXECUTE FUNCTION public.enforce_workpaper_lock();
