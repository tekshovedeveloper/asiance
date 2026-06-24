"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { sendFriendRequest, cancelFriendRequest } from "@/lib/api";
import type { Member } from "@/lib/types";
import type { FriendStatus } from "./MembersGrid";

type ButtonState = "idle" | "loading" | "sent" | "cancelling" | "friends" | "error";

function statusToButtonState(s: FriendStatus): ButtonState {
  if (s === "accepted") return "friends";
  if (s === "pending") return "sent";
  return "idle";
}

export function MemberCard({
  member,
  isCurrentUser = false,
  initialFriendStatus = "none",
}: {
  member: Member;
  isCurrentUser?: boolean;
  initialFriendStatus?: FriendStatus;
}) {
  const [state, setState] = useState<ButtonState>(statusToButtonState(initialFriendStatus));

  useEffect(() => {
    setState(statusToButtonState(initialFriendStatus));
  }, [initialFriendStatus]);

  const userId = (member.id ?? member._id ?? "").toString();

  const handleAddFriend = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (state !== "idle" || !userId) return;
    setState("loading");
    try {
      await sendFriendRequest(userId);
      setState("sent");
    } catch {
      setState("error");
      setTimeout(() => setState("idle"), 2500);
    }
  };

  const handleCancel = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (state !== "sent" || !userId) return;
    setState("cancelling");
    try {
      await cancelFriendRequest(userId);
      setState("idle");
    } catch {
      setState("sent");
    }
  };

  return (
    <div className="member-card">
      <Link href={`/members/${member.handle}`} className="member-card-inner">
        <img
          src={member.avatar || "/assets/profile/dymmy-profile.jpeg"}
          alt={member.name}
        />
        <h3>{member.name}</h3>
        <span className="profile-handle">@{member.handle}</span>
        <p>{member.bio}</p>
        <span className="small-link">{member.status}</span>
      </Link>

      {!isCurrentUser && (
        <div className="member-card-actions">
          {(state === "idle" || state === "loading" || state === "error") && (
            <button
              type="button"
              className={[
                "member-add-friend-btn",
                state === "error" ? "member-add-friend-btn--error" : "",
              ].filter(Boolean).join(" ")}
              onClick={handleAddFriend}
              disabled={state === "loading"}
            >
              {state === "loading" ? "Sending…" : state === "error" ? "Login to add" : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <line x1="19" y1="8" x2="19" y2="14" />
                    <line x1="16" y1="11" x2="22" y2="11" />
                  </svg>
                  Add Friend
                </>
              )}
            </button>
          )}

          {(state === "sent" || state === "cancelling") && (
            <button
              type="button"
              className="member-add-friend-btn member-add-friend-btn--sent"
              onClick={handleCancel}
              disabled={state === "cancelling"}
              title="Click to cancel request"
            >
              {state === "cancelling" ? "Cancelling…" : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Request Sent
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ marginLeft: 3, opacity: 0.7 }}>
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </>
              )}
            </button>
          )}

          {state === "friends" && (
            <span className="member-add-friend-btn member-add-friend-btn--friends">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              Friends
            </span>
          )}
        </div>
      )}
    </div>
  );
}
