import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AccountType = "player" | "partner" | "both";

interface AuthCtx {
  user: User | null;
  session: Session | null;
  loading: boolean;
  accountType: AccountType | null;
  isAdmin: boolean;
  isOwner: boolean;
  isPlayer: boolean;
  isPartner: boolean;
  signOut: () => Promise<void>;
}

const Ctx = createContext<AuthCtx>({
  user: null,
  session: null,
  loading: true,
  accountType: null,
  isAdmin: false,
  isOwner: false,
  isPlayer: false,
  isPartner: false,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [accountType, setAccountType] = useState<AccountType | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setLoading(false);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const uid = session?.user?.id;
    if (!uid) {
      setAccountType(null);
      setIsAdmin(false);
      setIsOwner(false);
      return;
    }
    Promise.all([
      supabase.from("user_roles").select("role").eq("user_id", uid).eq("role", "admin").maybeSingle(),
      supabase.from("owners").select("status").eq("id", uid).maybeSingle(),
      supabase.from("profiles").select("account_type").eq("id", uid).maybeSingle(),
    ]).then(([adminRes, ownerRes, profileRes]) => {
      setIsAdmin(!!adminRes.data);
      const approvedOwner = ownerRes.data?.status === "approved";
      setIsOwner(approvedOwner);

      setAccountType(approvedOwner ? "both" : "player");
    });
  }, [session?.user?.id]);

  const isPlayer = !!session?.user;
  const isPartner = isOwner;

  return (
    <Ctx.Provider
      value={{
        user: session?.user ?? null,
        session,
        loading,
        accountType,
        isAdmin,
        isOwner,
        isPlayer,
        isPartner,
        signOut: async () => {
          await supabase.auth.signOut();
        },
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);
