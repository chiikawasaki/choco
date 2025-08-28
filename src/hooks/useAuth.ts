"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase-client";
import { Session, User } from "@supabase/supabase-js";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const supabase = getSupabaseClient();

  useEffect(() => {
    let mounted = true;

    // 現在のセッションを取得
    const getSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("Session error:", error);
          if (mounted) {
            router.replace("/login");
          }
          return;
        }

        if (session?.user && mounted) {
          console.log("User authenticated:", session.user.id);
          setUser(session.user);
        } else if (mounted) {
          console.log("No session found, redirecting to login");
          router.replace("/login");
          return;
        }
      } catch (error) {
        console.error("Auth error:", error);
        if (mounted) {
          router.replace("/login");
        }
        return;
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    getSession();

    // 認証状態の変更を監視
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (event: string, session: Session | null) => {
        console.log("Auth state change:", event, session?.user?.id);

        if (!mounted) return;

        if (event === "SIGNED_IN" && session?.user) {
          setUser(session.user);
          setLoading(false);
        } else if (event === "SIGNED_OUT") {
          setUser(null);
          setLoading(false);
          router.replace("/login");
        } else if (event === "INITIAL_SESSION") {
          if (session?.user) {
            setUser(session.user);
          }
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [router, supabase.auth]);

  return { user, loading };
}
