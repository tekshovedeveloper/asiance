"use client";

import { useEffect, useState } from "react";
import { updateMe } from "@/lib/api";
import styles from "../dashboard.module.css";
import type { DashboardUser } from "../types";

type PrivacyForm = {
  showFriends: boolean;
  showProducts: boolean;
};

export function AccountPrivacyPanel({
  user,
  onUserChange,
}: {
  user: DashboardUser;
  onUserChange: (u: DashboardUser) => void;
}) {
  const [form, setForm] = useState<PrivacyForm>({
    showFriends: Boolean(user.showFriends),
    showProducts: Boolean(user.showProducts),
  });
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setForm({
      showFriends: Boolean(user.showFriends),
      showProducts: Boolean(user.showProducts),
    });
  }, [user.showFriends, user.showProducts]);

  async function save() {
    setSaving(true);
    setStatus(null);
    setError(null);

    try {
      const updated = await updateMe(form);
      onUserChange(updated);
      setStatus("Account privacy saved.");
    } catch (err: any) {
      setError(err?.message ?? "Could not save account privacy.");
    } finally {
      setSaving(false);
    }
  }

  const options: Array<{
    key: keyof PrivacyForm;
    title: string;
    copy: string;
  }> = [
    {
      key: "showFriends",
      title: "Show friends",
      copy: "Allow visitors to see the Friends tab on your profile.",
    },
    {
      key: "showProducts",
      title: "Show orders",
      copy: "Allow visitors to see product cards from your past purchases.",
    },
  ];

  return (
    <section className={styles.tabsCard}>
      <div className={styles.tabsBody}>
        <div className={styles.subhead}>
          <div>Account Privacy</div>
        </div>

        <div style={{ display: "grid", gap: 12 }}>
          {options.map((option) => (
            <label
              key={option.key}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 18,
                border: "1px solid #e6e9ef",
                borderRadius: 12,
                background: "#fff",
                padding: "16px 18px",
                cursor: "pointer",
              }}
            >
              <span style={{ display: "grid", gap: 4 }}>
                <strong style={{ color: "#2B3A42", fontSize: 15 }}>
                  {option.title}
                </strong>
                <span style={{ color: "#6b7685", fontSize: 13, lineHeight: 1.45 }}>
                  {option.copy}
                </span>
              </span>

              <input
                type="checkbox"
                checked={form[option.key]}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    [option.key]: event.target.checked,
                  }))
                }
                style={{ width: 18, height: 18, flex: "0 0 auto" }}
              />
            </label>
          ))}

          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 4 }}>
            <button
              type="button"
              className="btn btn-dark"
              onClick={save}
              disabled={saving}
              style={{
                width: "auto",
                minWidth: 140,
                fontSize: 10,
                fontFamily: "var(--sans)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              {saving ? "Saving..." : "Save changes"}
            </button>

            {status ? <span style={{ color: "#166534", fontSize: 13 }}>{status}</span> : null}
            {error ? <span style={{ color: "#b42318", fontSize: 13 }}>{error}</span> : null}
          </div>
        </div>
      </div>
    </section>
  );
}
