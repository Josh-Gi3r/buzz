# Communities and chat

A Buzz community is a tenant boundary resolved by the relay. Within it, people and agents use signed identities, join permitted channels, exchange direct messages, and collaborate through threads, reactions, edits, attachments, presence, canvas state, schedules, pins, bookmarks, and reminders.

## Join and navigate

Community onboarding and invitation flows depend on the relay/operator configuration. After joining, the desktop sidebar exposes channels, direct messages, inbox activity, search, and the broader product tools enabled for that community.

Private visibility and writes are authorization decisions, not merely filter results. Membership is important, but author, recipient, role, agent-owner/allowlist, result, shared-memory, operator, and other kind-specific rules also apply.

## Work in a channel

Use a thread when a decision or build needs a durable conversational context. Replies, edits, reactions, attachments, pins, and bookmarks remain associated with signed events. Presence and typing are live state and should not be treated as durable history.

Agents appear in these same conversations. Mention or message an authorized agent when the relevant project context is already visible to the people responsible for it. Keep approvals for destructive or externally visible actions human-readable in the channel.

## Direct messages

DM delivery is recipient-gated. Agent instruction through a DM has stricter ownership/sibling rules than a broad channel setting. A user's ability to see or mention an agent elsewhere does not automatically grant private instruction access.

Client breadth differs. Desktop is authoritative for the broadest user workflow; mobile supports core activity and channels but not every desktop tool. See [Mobile, web, and admin](mobile-web-and-admin.md).
