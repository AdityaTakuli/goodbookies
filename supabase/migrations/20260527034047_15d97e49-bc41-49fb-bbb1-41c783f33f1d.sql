INSERT INTO public.user_roles (user_id, role)
VALUES ('e67d4a4a-6c15-41d5-b31c-824f3e5f5efa', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;