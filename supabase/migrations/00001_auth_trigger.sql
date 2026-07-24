-- 1. Create a default organization for new signups if it doesn't exist
INSERT INTO public.organizations (id, name, industry)
VALUES ('00000000-0000-0000-0000-000000000001', 'Acme Global Corporation', 'Technology')
ON CONFLICT (id) DO NOTHING;

-- 2. Create the trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, organization_id, full_name, role)
  VALUES (
    NEW.id, 
    '00000000-0000-0000-0000-000000000001', -- Assign to the default mock organization
    NEW.raw_user_meta_data->>'full_name',
    'Admin'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Attach the trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
