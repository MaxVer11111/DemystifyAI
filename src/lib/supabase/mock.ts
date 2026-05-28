// src/lib/supabase/mock.ts
// Mock Supabase client for UI testing without a real auth backend

interface MockUser {
  id: string;
  email: string;
  user_metadata: { name: string; avatar_initials: string };
}

const MOCK_USER: MockUser = {
  id: "mock-user-001",
  email: "alex.kimura@example.com",
  user_metadata: { name: "Alex Kimura", avatar_initials: "AK" },
};

export function createMockClient() {
  return {
    auth: {
      signInWithPassword: async (_params: { email: string; password: string }) => {
        // Simulate network delay
        await new Promise((r) => setTimeout(r, 1000));
        if (!_params.email) {
          return { data: { user: null, session: null }, error: { message: "Email is required" } };
        }
        if (!_params.password || _params.password.length < 6) {
          return { data: { user: null, session: null }, error: { message: "Invalid password" } };
        }
        return {
          data: {
            user: MOCK_USER,
            session: { access_token: "mock-token", user: MOCK_USER },
          },
          error: null,
        };
      },
      signOut: async () => {
        await new Promise((r) => setTimeout(r, 300));
        return { error: null };
      },
      getSession: async () => ({
        data: { session: { user: MOCK_USER } },
        error: null,
      }),
      getUser: async () => ({
        data: { user: MOCK_USER },
        error: null,
      }),
      onAuthStateChange: (_callback: (event: string, session: any) => void) => {
        return { data: { subscription: { unsubscribe: () => {} } } };
      },
    },
  };
}
