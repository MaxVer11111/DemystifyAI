"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

const MOCK_ACTIVITY = [
  { id: "1", title: "Transformers & Attention: A Visual Guide", meta: "Completed 2 days ago" },
  { id: "2", title: "Andrej Karpathy: AI for Everyone", meta: "Watched 1 week ago" },
];

export default function AccountPage() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data?.user ?? null);
    });
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/signin");
  };

  const displayName =
    user?.user_metadata?.name ?? user?.email?.split("@")[0] ?? "User";
  const initials =
    user?.email?.charAt(0).toUpperCase() ?? "?";

  return (
    <>
      <div className="account-wrap">
        <div className="account-header">
          <div className="account-avatar">
            <div className="avatar-circle">{initials}</div>
          </div>
          <div className="account-heading">
            <h1>{displayName}</h1>
            <p className="heading-meta">{user?.email}</p>
          </div>
          <div className="account-header-right">
            <button className="btn btn-secondary btn-xs" onClick={handleSignOut}>
              Sign out
            </button>
          </div>
        </div>

        <div className="acard">
          <div className="acard-header">
            <h2>Course History</h2>
            <p>Courses you have opened or accessed.</p>
          </div>

          {MOCK_ACTIVITY.map((item) => (
            <div key={item.id} className="activity-row">
              <span className="activity-title">{item.title}</span>
              <span className="activity-meta">{item.meta}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
