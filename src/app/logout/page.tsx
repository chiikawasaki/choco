import { supabase } from "@/lib/supabase";

const Header = () => {
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error(error.message);
    } else {
      console.log("User logged out");
    }
  };

  return (
    <header>
      <button onClick={handleLogout}>Logout</button>
    </header>
  );
};

export default Header;
