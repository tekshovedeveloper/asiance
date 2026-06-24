"use client";

import { useEffect, useState } from "react";
import { getMe, getFriendsList, getOutgoingRequests } from "@/lib/api";
import { MemberCard } from "./MemberCard";
import type { Member } from "@/lib/types";

export type FriendStatus = "none" | "pending" | "accepted";

export function MembersGrid({ members }: { members: Member[] }) {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [statuses, setStatuses] = useState<Record<string, FriendStatus>>({});

  useEffect(() => {
    async function load() {
      try {
        const me = await getMe();
        setCurrentUserId(me.id ?? null);

        const [friends, outgoing] = await Promise.all([
          getFriendsList(),
          getOutgoingRequests(),
        ]);

        const map: Record<string, FriendStatus> = {};
        for (const f of friends) map[f._id.toString()] = "accepted";
        for (const r of outgoing) map[r.userId] = "pending";
        setStatuses(map);
      } catch {
        // not logged in — leave statuses empty (buttons show idle)
      }
    }
    load();
  }, []);

  return (
    <div className="members-grid">
      {members.map((member) => {
        const memberId = (member.id ?? member._id ?? "").toString();
        const isMe = !!currentUserId && memberId === currentUserId;
        const friendStatus: FriendStatus = statuses[memberId] ?? "none";
        return (
          <MemberCard
            key={member.handle}
            member={member}
            isCurrentUser={isMe}
            initialFriendStatus={friendStatus}
          />
        );
      })}
    </div>
  );
}
