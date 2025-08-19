"use client";

import { toaster } from "@/components/ui/toaster";
import { supabase } from "@/lib/supabase";
import { Button } from "@chakra-ui/react";
import { useRouter } from "next/navigation";

const Logout = () => {
  const router = useRouter();
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error(error.message);
    } else {
      console.log("User logged out");
      toaster.create({
        title: "ログアウトしました",
        type: "success",
      });
      router.push("/");
    }
  };

  return <Button onClick={handleLogout}>Logout</Button>;
};

export default Logout;
