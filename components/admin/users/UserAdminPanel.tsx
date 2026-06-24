'use client';

import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import { Ban, CheckCircle, Eye, Pencil, Search, Trash2 } from 'lucide-react';
import { API_URL } from '@/lib/api';
import { PasswordInput } from '@/components/PasswordInput';

type AdminUser = {
  id: string;
  name: string;
  email: string;
  handle: string;
  role: 'admin' | 'member';
  avatar: string;
  bio: string;
  location: string;
  isBlocked: boolean;
  createdAt?: string;
};

type EditForm = {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'member';
};

type Props = {
  token: string;
  onChanged?: () => void;
};

export function UserAdminPanel({ token, onChanged }: Props) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [viewingUser, setViewingUser] = useState<AdminUser | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({ name: '', email: '', password: '', role: 'member' });
  const [saving, setSaving] = useState(false);

  function authHeaders(extra: Record<string, string> = {}) {
    return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...extra };
  }

  async function loadUsers(q = '') {
    setLoading(true);
    try {
      const url = q
        ? `${API_URL}/admin/users?search=${encodeURIComponent(q)}`
        : `${API_URL}/admin/users`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('load failed');
      setUsers(await res.json());
    } catch {
      setStatusMsg('Failed to load users.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadUsers();
  }, []);

  function openEdit(user: AdminUser) {
    setEditingUser(user);
    setEditForm({ name: user.name, email: user.email, password: '', role: user.role });
  }

  async function saveEdit() {
    if (!editingUser) return;
    setSaving(true);
    try {
      const payload: Record<string, string> = {
        name: editForm.name,
        email: editForm.email,
        role: editForm.role,
      };
      if (editForm.password) payload.password = editForm.password;

      const res = await fetch(`${API_URL}/admin/users/${editingUser.id}`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('save failed');
      setStatusMsg('User updated successfully.');
      setEditingUser(null);
      await loadUsers();
      onChanged?.();
    } catch {
      setStatusMsg('Update failed. Try again.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(user: AdminUser) {
    if (!window.confirm(`Delete "${user.name}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`${API_URL}/admin/users/${user.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('delete failed');
      setStatusMsg('User deleted.');
      await loadUsers();
      onChanged?.();
    } catch {
      setStatusMsg('Delete failed.');
    }
  }

  async function toggleBlock(user: AdminUser) {
    try {
      const res = await fetch(`${API_URL}/admin/users/${user.id}/block`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ isBlocked: !user.isBlocked }),
      });
      if (!res.ok) throw new Error('block failed');
      setStatusMsg(user.isBlocked ? 'User unblocked.' : 'User blocked.');
      await loadUsers();
    } catch {
      setStatusMsg('Action failed.');
    }
  }

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      !q ||
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.handle.toLowerCase().includes(q)
    );
  });

  return (
    <section className="wp-list-screen">
      <div className="wp-list-top">
        <div className="wp-view-links">
          <span style={{ fontWeight: 600, fontSize: 20 }}>All Users</span>
          <span style={{ color: '#888', fontSize: 14, marginLeft: 8 }}>({users.length} total)</span>
        </div>
        <div className="wp-search">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && void loadUsers(search)}
            placeholder="Search by name, email or handle..."
            aria-label="Search users"
          />
          <button type="button" onClick={() => void loadUsers(search)}>
            <Search size={15} />
            Search Users
          </button>
        </div>
      </div>

      {statusMsg && (
        <p style={{ padding: '6px 16px', fontSize: 13, color: '#555', borderBottom: '1px solid #f0f0f0' }}>
          {statusMsg}
        </p>
      )}

      {loading ? (
        <p style={{ padding: 20 }}>Loading users...</p>
      ) : (
        <div className="wp-table-wrap">
          <table className="wp-news-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Handle</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr key={user.id} style={{ opacity: user.isBlocked ? 0.6 : 1 }}>
                  <td className="title-column">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt=""
                          style={{ width: 30, height: 30, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                        />
                      ) : (
                        <div style={{
                          width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                          background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 13, fontWeight: 600, color: '#6b7280',
                        }}>
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span style={{ fontWeight: 500 }}>{user.name}</span>
                    </div>
                  </td>
                  <td style={{ fontSize: 13 }}>{user.email}</td>
                  <td style={{ fontSize: 13, color: '#6b7280' }}>@{user.handle}</td>
                  <td>
                    <span style={{
                      padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600,
                      background: user.role === 'admin' ? '#1e40af' : '#e5e7eb',
                      color: user.role === 'admin' ? '#fff' : '#374151',
                      textTransform: 'uppercase', letterSpacing: '0.04em',
                    }}>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <span style={{
                      padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600,
                      background: user.isBlocked ? '#fee2e2' : '#dcfce7',
                      color: user.isBlocked ? '#991b1b' : '#166534',
                    }}>
                      {user.isBlocked ? 'Blocked' : 'Active'}
                    </span>
                  </td>
                  <td style={{ fontSize: 12, color: '#9ca3af' }}>
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                      <button
                        type="button"
                        title="View Details"
                        onClick={() => setViewingUser(user)}
                        style={actionBtnStyle}
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        type="button"
                        title="Edit User"
                        onClick={() => openEdit(user)}
                        style={actionBtnStyle}
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        title={user.isBlocked ? 'Unblock User' : 'Block User'}
                        onClick={() => void toggleBlock(user)}
                        style={{ ...actionBtnStyle, color: user.isBlocked ? '#16a34a' : '#d97706' }}
                      >
                        {user.isBlocked ? <CheckCircle size={14} /> : <Ban size={14} />}
                      </button>
                      <button
                        type="button"
                        title="Delete User"
                        onClick={() => void handleDelete(user)}
                        style={{ ...actionBtnStyle, color: '#dc2626' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!filtered.length && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', color: '#9ca3af', padding: 24 }}>
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>Edit User</h2>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, lineHeight: 1, color: '#6b7280' }}
              >
                ×
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <label style={labelStyle}>
                Full Name
                <input
                  style={inputStyle}
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  placeholder="Full name"
                />
              </label>
              <label style={labelStyle}>
                Email
                <input
                  style={inputStyle}
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  placeholder="Email address"
                />
              </label>
              <label style={labelStyle}>
                New Password
                <span style={{ fontSize: 11, fontWeight: 400, color: '#9ca3af', marginLeft: 4 }}>
                  (leave blank to keep current)
                </span>
                <PasswordInput
                  style={inputStyle}
                  value={editForm.password}
                  onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                  placeholder="Enter new password..."
                  autoComplete="new-password"
                />
              </label>
              <label style={labelStyle}>
                Role
                <select
                  style={inputStyle}
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value as 'admin' | 'member' })}
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
              </label>
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 22, justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                style={{ padding: '8px 18px', border: '1px solid #d1d5db', borderRadius: 4, cursor: 'pointer', background: '#fff', fontSize: 14 }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void saveEdit()}
                disabled={saving}
                style={{ padding: '8px 18px', background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: 4, cursor: saving ? 'not-allowed' : 'pointer', fontSize: 14, opacity: saving ? 0.7 : 1 }}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View User Modal */}
      {viewingUser && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>User Details</h2>
              <button
                type="button"
                onClick={() => setViewingUser(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, lineHeight: 1, color: '#6b7280' }}
              >
                ×
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
              {viewingUser.avatar ? (
                <img
                  src={viewingUser.avatar}
                  alt=""
                  style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{
                  width: 64, height: 64, borderRadius: '50%',
                  background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 24, fontWeight: 700, color: '#6b7280',
                }}>
                  {viewingUser.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <p style={{ margin: 0, fontWeight: 600, fontSize: 16 }}>{viewingUser.name}</p>
                <p style={{ margin: 0, color: '#6b7280', fontSize: 13 }}>@{viewingUser.handle}</p>
              </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <tbody>
                {[
                  ['Email', viewingUser.email],
                  ['Role', viewingUser.role],
                  ['Status', viewingUser.isBlocked ? 'Blocked' : 'Active'],
                  ['Bio', viewingUser.bio || '—'],
                  ['Location', viewingUser.location || '—'],
                  ['Joined', viewingUser.createdAt ? new Date(viewingUser.createdAt).toLocaleDateString() : '—'],
                ].map(([label, value]) => (
                  <tr key={label} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '9px 4px', color: '#9ca3af', width: 90, fontWeight: 500 }}>{label}</td>
                    <td style={{ padding: '9px 4px', color: '#111827' }}>{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ display: 'flex', gap: 8, marginTop: 20, justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => { setViewingUser(null); openEdit(viewingUser); }}
                style={{ padding: '8px 18px', background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 14 }}
              >
                Edit User
              </button>
              <button
                type="button"
                onClick={() => setViewingUser(null)}
                style={{ padding: '8px 18px', border: '1px solid #d1d5db', borderRadius: 4, cursor: 'pointer', background: '#fff', fontSize: 14 }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

const overlayStyle: CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
};

const modalStyle: CSSProperties = {
  background: '#fff',
  borderRadius: 8,
  padding: 28,
  width: '100%',
  maxWidth: 480,
  maxHeight: '90vh',
  overflowY: 'auto',
  boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
};

const labelStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 5,
  fontSize: 13,
  fontWeight: 600,
  color: '#374151',
};

const inputStyle: CSSProperties = {
  padding: '8px 12px',
  border: '1px solid #d1d5db',
  borderRadius: 4,
  fontSize: 14,
  width: '100%',
  boxSizing: 'border-box',
  background: '#fff',
};

const actionBtnStyle: CSSProperties = {
  background: 'none',
  border: '1px solid #e5e7eb',
  borderRadius: 4,
  padding: '4px 7px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  color: '#374151',
};
