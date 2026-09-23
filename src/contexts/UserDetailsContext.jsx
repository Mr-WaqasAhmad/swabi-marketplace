import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../components/supabaseClient"; // Sahi path check kar lein

const UserDetailsContext = createContext();

export const UserDetailsProvider = ({ children }) => {
  const [user, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper function: Auth object se user object extract karne ke liye
  const formatUserData = (authUser) => {
    if (!authUser) return null;
    return {
      ...authUser,
      // Metadata values ko primary properties par map karein
      full_name: authUser.user_metadata?.full_name || authUser.full_name || "",
      phone: authUser.user_metadata?.phone || authUser.phone || "",
      location: authUser.user_metadata?.location || authUser.location || "",
      address: authUser.user_metadata?.location || authUser.address || "",
    };
  };

  useEffect(() => {
    // 1. Current Session Fetch Karein
    const getInitialUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUserData(formatUserData(session.user));
      }
      setLoading(false);
    };

    getInitialUser();

    // 2. Auth State Change Listener (Jab updateUser run hoga, yeh automatically trigger hoga)
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          setUserData(formatUserData(session.user));
        } else {
          setUserData(null);
        }
        setLoading(false);
      }
    );

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  return (
    <UserDetailsContext.Provider value={{ user, setUserData, loading }}>
      {children}
    </UserDetailsContext.Provider>
  );
};

export const useUser = () => useContext(UserDetailsContext);