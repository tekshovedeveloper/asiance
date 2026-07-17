// "use client";

// import { useState } from "react";
// import styles from "./dashboard.module.css";
// import type { DashboardUser } from "./types";
// import { LibraryPickerModal, type LibraryAsset } from "./LibraryPickerModal";

// export function ProfilePanel({
//   user,
//   onUserChange,
// }: {
//   user: DashboardUser;
//   onUserChange: (u: DashboardUser) => void;
// }) {
//   const [form, setForm] = useState({
//     name: user.name ?? "",
//     username: user.username ?? "",
//     email: user.email ?? "",
//     bio: user.bio ?? "",
//     avatarUrl: user.avatarUrl ?? "",
//     coverImageUrl: user.coverImageUrl ?? "",
//   });

//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const [pickMode, setPickMode] = useState<null | "avatar" | "cover">(null);

//   async function save() {
//     setSaving(true);
//     setError(null);

//     try {
//       const res = await fetch("/api/me", {
//         method: "PATCH",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(form),
//       });

//       if (!res.ok) {
//         const msg = await res.text();
//         throw new Error(msg || "Failed to update profile");
//       }

//       const updated: DashboardUser = await res.json();
//       onUserChange(updated);
//     } catch (e: any) {
//       setError(e?.message ?? "Something went wrong");
//     } finally {
//       setSaving(false);
//     }
//   }

//   function onPick(asset: LibraryAsset) {
//     if (pickMode === "avatar") {
//       setForm((p) => ({ ...p, avatarUrl: asset.url }));
//     } else if (pickMode === "cover") {
//       setForm((p) => ({ ...p, coverImageUrl: asset.url }));
//     }
//     setPickMode(null);
//   }

//   return (
//     <div className={styles.profilePanel}>
//       <div className={styles.profileGrid}>
//         <div className={styles.profileField}>
//           <label className={styles.profileLabel}>Name</label>
//           <input
//             className={styles.profileInput}
//             value={form.name}
//             onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
//           />
//         </div>

//         <div className={styles.profileField}>
//           <label className={styles.profileLabel}>Username</label>
//           <input
//             className={styles.profileInput}
//             value={form.username}
//             onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))}
//           />
//         </div>

//         <div className={styles.profileField}>
//           <label className={styles.profileLabel}>Email</label>
//           <input
//             className={styles.profileInput}
//             value={form.email}
//             onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
//           />
//         </div>

//         <div className={styles.profileFieldFull}>
//           <label className={styles.profileLabel}>Bio</label>
//           <textarea
//             className={styles.profileTextarea}
//             value={form.bio}
//             onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
//             rows={4}
//           />
//         </div>

//         <div className={styles.profileActionsRow}>
//           <button
//             type="button"
//             className={styles.profileBtn}
//             onClick={() => setPickMode("avatar")}
//           >
//             Change profile photo
//           </button>

//           <button
//             type="button"
//             className={styles.profileBtn}
//             onClick={() => setPickMode("cover")}
//           >
//             Change cover photo
//           </button>

//           <div className={styles.profileSaveWrap}>
//             <button
//               type="button"
//               className={styles.profileSave}
//               onClick={save}
//               disabled={saving}
//             >
//               {saving ? "Saving..." : "Save changes"}
//             </button>
//           </div>
//         </div>

//         {error ? <div className={styles.profileError}>{error}</div> : null}
//       </div>

//       <LibraryPickerModal
//         open={pickMode !== null}
//         title={pickMode === "avatar" ? "Choose profile photo" : "Choose cover photo"}
//         onClose={() => setPickMode(null)}
//         onPick={onPick}
//       />
//     </div>
//   );
// }







"use client";

import { useRef, useState } from "react";
import styles from "../dashboard.module.css";
import type { DashboardUser } from "../types";
import { updateMe, uploadImage } from "@/lib/api";

const BIO_LETTER_LIMIT = 250;

function limitBioLetters(value: string) {
  return value.slice(0, BIO_LETTER_LIMIT);
}

function parseProfileTags(value: string) {
  return value
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 6);
}

export function ProfilePanel({
  user,
  onUserChange,
}: {
  user: DashboardUser;
  onUserChange: (u: DashboardUser) => void;
}) {
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: user.name ?? "",
    username: user.username ?? "",
    email: user.email ?? "",
    bio: limitBioLetters(user.bio ?? ""),
    avatarUrl: user.avatarUrl ?? "",
    coverImageUrl: user.coverImageUrl ?? "",
    facebookUrl: user.facebookUrl ?? "",
    instagramUrl: user.instagramUrl ?? "",
    tiktokUrl: user.tiktokUrl ?? "",
    snapchatUrl: user.snapchatUrl ?? "",
    emailLink: user.emailLink ?? "",
  });
  const [tagText, setTagText] = useState((user.interests ?? []).join(', '));

  const [busy, setBusy] = useState<null | "avatar" | "cover" | "save">(null);
  const [error, setError] = useState<string | null>(null);
  const bioLetterCount = form.bio.length;

  async function pickAndUpload(kind: "avatar" | "cover", file: File) {
    setError(null);
    setBusy(kind);
    try {
      const uploaded = await uploadImage(file); // => { url }
      setForm((p) =>
        kind === "avatar"
          ? { ...p, avatarUrl: uploaded.url }
          : { ...p, coverImageUrl: uploaded.url }
      );
    } catch (e: any) {
      setError(e?.message ?? "Upload failed");
    } finally {
      setBusy(null);
    }
  }

  async function save() {
    setError(null);
    setBusy("save");
    try {
      const updated = await updateMe({
        ...form,
        bio: limitBioLetters(form.bio),
        interests: parseProfileTags(tagText),
      });
      onUserChange(updated);
    } catch (e: any) {
      setError(e?.message ?? "Save failed");
    } finally {
      setBusy(null);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    border: '1px solid rgba(18, 59, 90, 0.08)',
    borderRadius: 18,
    background: 'rgba(18, 59, 90, 0.045)',
    color: '#2B3A42',
    padding: '10px 16px',
    fontSize: '13px',
    lineHeight: 1.45,
    outline: 'none',
    fontFamily: 'var(--mono)',
    letterSpacing: '0.02em',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.75)',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: 300,
    color: '#2B3A42',
    fontFamily: 'var(--serif)',
    letterSpacing: '-0.01em',
    lineHeight: 1.08,
    marginBottom: 6,
    display: 'block',
  };

  const socialFields = [
    { key: 'facebookUrl', label: 'Facebook link', placeholder: 'https://facebook.com/your-profile' },
    { key: 'instagramUrl', label: 'Instagram link', placeholder: 'https://instagram.com/your-profile' },
    { key: 'tiktokUrl', label: 'TikTok link', placeholder: 'https://tiktok.com/@your-profile' },
    { key: 'snapchatUrl', label: 'Snapchat link', placeholder: 'https://snapchat.com/add/your-profile' },
    { key: 'emailLink', label: 'Email link', placeholder: 'hello@example.com or mailto:hello@example.com' },
  ] as const;

  return (
    <div style={{ padding: '6px 2px' }}>
      <input ref={avatarInputRef} type="file" accept="image/*" hidden
        onChange={(e) => { const f = e.target.files?.[0]; if (f) pickAndUpload("avatar", f); e.currentTarget.value = ""; }}
      />
      <input ref={coverInputRef} type="file" accept="image/*" hidden
        onChange={(e) => { const f = e.target.files?.[0]; if (f) pickAndUpload("cover", f); e.currentTarget.value = ""; }}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <label style={labelStyle}>Name</label>
          <input style={inputStyle} value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
        </div>

        <div>
          <label style={labelStyle}>Username</label>
          <input style={inputStyle} value={form.username}
            onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))} />
        </div>

        <div style={{ gridColumn: '1 / -1' }}>
          <label style={labelStyle}>Profile tags</label>
          <input
            style={inputStyle}
            value={tagText}
            placeholder="Wellness, Mindset, Self-Care"
            onChange={(e) => setTagText(e.target.value)}
          />
        </div>

        <div style={{ gridColumn: '1 / -1' }}>
          <label style={labelStyle}>Email</label>
          <input style={inputStyle} value={form.email}
            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
        </div>

        <div style={{ gridColumn: '1 / -1' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, marginBottom: 6 }}>
            <label style={{ ...labelStyle, marginBottom: 0 }}>Bio</label>
            <span style={{ color: bioLetterCount >= BIO_LETTER_LIMIT ? '#9c2eb3' : '#6d7780', fontSize: 12, fontFamily: 'var(--mono)' }}>
              {bioLetterCount}/{BIO_LETTER_LIMIT} letters
            </span>
          </div>
          <textarea
            rows={5}
            style={{ ...inputStyle, resize: 'vertical', minHeight: 110 }}
            value={form.bio}
            maxLength={BIO_LETTER_LIMIT}
            onChange={(e) => setForm((p) => ({ ...p, bio: limitBioLetters(e.target.value) }))}
          />
        </div>

        {socialFields.map((field) => (
          <div
            key={field.key}
            style={{ gridColumn: field.key === 'emailLink' ? '1 / -1' : undefined }}
          >
            <label style={labelStyle}>{field.label}</label>
            <input
              style={inputStyle}
              value={form[field.key]}
              placeholder={field.placeholder}
              onChange={(e) => setForm((p) => ({ ...p, [field.key]: e.target.value }))}
            />
          </div>
        ))}

        <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginTop: 4 }}>
          <button type="button" className="chip-btn" style={{ padding: '8px 16px', fontSize: '10px', fontFamily: 'var(--sans)', letterSpacing: '0.04em', textTransform: 'uppercase' }}
            onClick={() => avatarInputRef.current?.click()} disabled={busy !== null}>
            {busy === "avatar" ? "Uploading..." : "Change profile photo"}
          </button>

          <button type="button" className="chip-btn" style={{ padding: '8px 16px', fontSize: '10px', fontFamily: 'var(--sans)', letterSpacing: '0.04em', textTransform: 'uppercase' }}
            onClick={() => coverInputRef.current?.click()} disabled={busy !== null}>
            {busy === "cover" ? "Uploading..." : "Change cover photo"}
          </button>

          <button type="button" className="btn btn-dark" style={{ marginLeft: 'auto', width: 'auto', minWidth: 140, fontSize: '10px', fontFamily: 'var(--sans)', letterSpacing: '0.08em', textTransform: 'uppercase' }}
            onClick={save} disabled={busy !== null}>
            {busy === "save" ? "Saving..." : "Save changes"}
          </button>
        </div>

        {error ? <p style={{ gridColumn: '1 / -1', color: '#b42318', fontSize: '1rem', margin: 0 }}>{error}</p> : null}
      </div>
    </div>
  );
}
