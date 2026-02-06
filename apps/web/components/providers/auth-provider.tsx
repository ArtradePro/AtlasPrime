"use client";

import {
  ReactNode,
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";

// ============================================================================
// CLERK AUTHENTICATION SETUP
// ============================================================================
// To enable Clerk authentication:
// 1. Create an account at https://clerk.com
// 2. Create a new application
// 3. Copy your API keys and add to .env.local:
//    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
//    CLERK_SECRET_KEY=sk_test_xxxxx
// 4. Uncomment the Clerk imports and ClerkAuthProvider below
// 5. Change AuthProvider export to use ClerkAuthProvider
// ============================================================================

// Uncomment when Clerk keys are configured:
// import { ClerkProvider, useUser, useClerk, SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";

interface User {
  id: string;
  email: string;
  name: string;
  imageUrl?: string;
  organizationId?: string;
}

interface AuthContextType {
  user: User | null;
  isLoaded: boolean;
  isSignedIn: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  // Demo mode helpers
  isDemoMode: boolean;
  organizationId: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Demo organization ID - matches seeded data
const DEMO_ORG_ID = "demo_org_atlas_prime";

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

// ============================================================================
// DEMO MODE AUTHENTICATION (Active when Clerk keys are not set)
// ============================================================================
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Auto-login demo user on mount
  useEffect(() => {
    // Check for stored session
    const storedUser =
      typeof window !== "undefined"
        ? localStorage.getItem("atlas_demo_user")
        : null;

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      // Auto-login demo user for seamless experience
      const demoUser = {
        id: "user_demo_001",
        email: "admin@atlasprime.com",
        name: "Demo User",
        imageUrl: undefined,
        organizationId: DEMO_ORG_ID,
      };
      setUser(demoUser);
      if (typeof window !== "undefined") {
        localStorage.setItem("atlas_demo_user", JSON.stringify(demoUser));
      }
    }
    setIsLoaded(true);
  }, []);

  const signIn = async (email: string, _password: string) => {
    const newUser = {
      id: "user_" + Date.now(),
      email,
      name: email.split("@")[0],
      organizationId: DEMO_ORG_ID,
    };
    setUser(newUser);
    if (typeof window !== "undefined") {
      localStorage.setItem("atlas_demo_user", JSON.stringify(newUser));
    }
  };

  const signOut = () => {
    setUser(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("atlas_demo_user");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoaded,
        isSignedIn: !!user,
        signIn,
        signOut,
        isDemoMode: true,
        organizationId: DEMO_ORG_ID,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ============================================================================
// CLERK AUTHENTICATION PROVIDER (Uncomment when Clerk keys are configured)
// ============================================================================
/*
export function ClerkAuthProvider({ children }: AuthProviderProps) {
  return (
    <ClerkProvider>
      <ClerkAuthWrapper>{children}</ClerkAuthWrapper>
    </ClerkProvider>
  );
}

function ClerkAuthWrapper({ children }: { children: ReactNode }) {
  const { user, isLoaded } = useUser();
  const { signOut: clerkSignOut } = useClerk();

  const authUser: User | null = user
    ? {
        id: user.id,
        email: user.primaryEmailAddress?.emailAddress || "",
        name: user.fullName || user.firstName || "User",
        imageUrl: user.imageUrl,
        organizationId: user.organizationMemberships?.[0]?.organization?.id,
      }
    : null;

  const signIn = async () => {
    // Clerk handles sign-in via its components
    throw new Error("Use Clerk SignIn component instead");
  };

  const signOut = () => {
    clerkSignOut();
  };

  return (
    <AuthContext.Provider
      value={{
        user: authUser,
        isLoaded,
        isSignedIn: !!user,
        signIn,
        signOut,
        isDemoMode: false,
        organizationId: authUser?.organizationId || "",
      }}
    >
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </AuthContext.Provider>
  );
}
*/
