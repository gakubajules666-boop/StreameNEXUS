# Security Specification: STREAMNEXUS Database Invariants

## 1. Security & Data Invariants

Our Firestore database enforces strict role-based and document-level security rules across the systems:

1. **User Identity Security**: No user can create or update a profile in `/users/{userId}` unless their authenticated UID exactly matches `{userId}`.
2. **Admin Whitelist**: Administrative permissions can ONLY be verified by checking document existence under `/admins/$(request.auth.uid)`. Client claims or custom token roles are strictly rejected.
3. **Immutability Bounds**: Critical account variables (`createdAt`, `originalOwnerId`, `uid`) can never be modified post-creation.
4. **Creator Earnings Preservation**: Earnings, view counts, and donation registers must be server-calculated, simulated securely, or shielded against arbitrary client writes.
5. **Video Approval Flow**: Regular users and creators can upload videos, but only users with administrative records in `/admins/{adminId}` can toggle `approved` to `true` or alter the `status` fields to `"approved"`.
6. **Rate-limiting & Denial of Wallet Preventative Rules**: Every path variable validation checks for standard string boundaries (`isValidId` ensures length <= 128 and matches `^[a-zA-Z0-9_\-]+$`), blocking oversized buffer overflows.
7. **Temporal Synchronization**: Create and update timestamps use strict server timestamps (`request.time`) instead of client clocks to ensure logging is authentic.

---

## 2. The "Dirty Dozen" Malicious Payloads

The following 12 payloads represent attacks designed to bypass app boundaries. Our security design guarantees that every attempt below results in a strict `PERMISSION_DENIED` status.

### Threat Vector 1: Profile Hijacking (Identity Spoofing)
* **Goal**: Write profile data into another user's profile database.
* **Target Path**: `/users/legitimate_user_123`
* **Attacking UID**: `hacker_999`
* **Payload**:
```json
{
  "uid": "legitimate_user_123",
  "displayName": "Hacked Profile",
  "email": "hijacked@example.com",
  "role": "user",
  "createdAt": "2026-05-21T11:00:00Z"
}
```
* **Failure Outcome**: Rejected. Rule forces `request.auth.uid == userId`.

### Threat Vector 2: Privilege Escalation (Admin Self-Promotion)
* **Goal**: Promote oneself to an Administrator during registration.
* **Target Path**: `/users/hacker_999`
* **Attacking UID**: `hacker_999`
* **Payload**:
```json
{
  "uid": "hacker_999",
  "displayName": "Hacker Pro",
  "email": "hacker@example.com",
  "role": "admin",
  "createdAt": "2026-05-21T11:00:00Z"
}
```
* **Failure Outcome**: Client writes to `role: 'admin'` are blocked unless write is done by an authenticated admin, or profile is restricted from setting privileged roles.

### Threat Vector 3: Forged Admin Whitelist Entry
* **Goal**: Create an entry directly in the administrative whitelists database.
* **Target Path**: `/admins/hacker_999`
* **Attacking UID**: `hacker_999`
* **Payload**:
```json
{
  "uid": "hacker_999",
  "email": "hacker@example.com"
}
```
* **Failure Outcome**: All writes to `/admins/{id}` are strictly denied unless the request originates from an existing admin.

### Threat Vector 4: Self-Approval of Uploaded Content
* **Goal**: Upload a video with an pre-approved state, bypassing moderation.
* **Target Path**: `/videos/backdoor_stream`
* **Attacking UID**: `creator_user_55`
* **Payload**:
```json
{
  "id": "backdoor_stream",
  "title": "Malware Video",
  "description": "Bypassing filters",
  "videoUrl": "https://malicious.com/stream.mp4",
  "thumbnailUrl": "https://malicious.com/thumbnail.png",
  "category": "movies",
  "creatorId": "creator_user_55",
  "creatorName": "Bad Actor",
  "creatorPhoto": "https://malicious.com/pic.png",
  "views": 0,
  "likes": [],
  "dislikes": [],
  "downloadsCount": 0,
  "isPremium": false,
  "duration": "5:00",
  "hasAds": false,
  "approved": true,
  "status": "approved",
  "createdAt": "2026-05-21T11:00:00Z"
}
```
* **Failure Outcome**: Creating video where `approved` is true or status is "approved" is restricted unless the user is an admin.

### Threat Vector 5: View Count Injection (Monetization Theft)
* **Goal**: Spoof views to earn ad revenue and payouts.
* **Target Path**: `/videos/popular_video`
* **Attacking UID**: `creator_user_55` (Owner of `/videos/popular_video`)
* **Payload**:
```json
{
  "$set": { "views": 999999999 }
}
```
* **Failure Outcome**: Direct updates to `views` or earnings from content-owners are blocked. It must only be done by system increments or actions whitelisted carefully.

### Threat Vector 6: Comment Impersonation (Defamation Attack)
* **Goal**: Speak on behalf of a public figure or moderator in video comments.
* **Target Path**: `/videos/big_buck_bunny/comments/fake_comment_7`
* **Attacking UID**: `hacker_999`
* **Payload**:
```json
{
  "id": "fake_comment_7",
  "videoId": "big_buck_bunny",
  "userId": "celebrity_creator_88",
  "userName": "Verified Star",
  "userPhoto": "https://star.com/pic.png",
  "text": "I endorse this scam!",
  "createdAt": "2026-05-21T11:00:00Z"
}
```
* **Failure Outcome**: Checked by comment validation rule `incoming().userId == request.auth.uid`.

### Threat Vector 7: Fake Donation Injection (Spoofing Contributions)
* **Goal**: Inject a fake donation record into `/donations` to unlock creator rewards without paying.
* **Target Path**: `/donations/forged_invoice_1`
* **Attacking UID**: `hacker_999`
* **Payload**:
```json
{
  "id": "forged_invoice_1",
  "creatorId": "lucrative_creator",
  "creatorName": "Gamer Pro",
  "donorName": "Anonymous Hacker",
  "amount": 10000.0,
  "message": "Paid!",
  "paymentMethod": "stripe",
  "createdAt": "2026-05-21T11:00:00Z"
}
```
* **Failure Outcome**: Direct insertion into donation registries is blocked or restricted to authenticated verified channels, and validated through isOwner constraints.

### Threat Vector 8: Overriding CreatedAt Timestamp (Temporal Fraud)
* **Goal**: Override video creation timestamps to remain on the "Trending/Latest Uploads" page.
* **Target Path**: `/videos/big_buck_bunny`
* **Attacking UID**: `blender_foundation_1`
* **Payload**:
```json
{
  "createdAt": "2029-12-31T23:59:59Z"
}
```
* **Failure Outcome**: Checked by strict temp constraint: `incoming().createdAt == request.time` during creation, or immutable checking during updates.

### Threat Vector 9: Buffer-Overrun Asset ID Attacks (Denial of Wallet)
* **Goal**: Creating documents with massive 1.5MB text string IDs, forcing massive indexes and DB storage exhaustion costs.
* **Target Path**: `/videos/overrun-[A-Z_x_1000000]`
* **Attacking UID**: `hacker_999`
* **Failure Outcome**: Evaluated by strict ID length bounds: `isValidId(videoId: <= 128 characters)`.

### Threat Vector 10: Ad-Campaign Bypass (Watch-Ad Hijacking)
* **Goal**: Directly toggling video settings `hasAds: false` on premium content.
* **Target Path**: `/videos/premium_video_id`
* **Attacking UID**: `user_watcher_4`
* **Payload**:
```json
{
  "hasAds": false
}
```
* **Failure Outcome**: Rejected since only the content-owner (creator) or checking admin can update video specifications.

### Threat Vector 11: Bulk Watch History Poisoning
* **Goal**: Directly editing someone else's watch logs to disrupt personalized recommendations.
* **Target Path**: `/users/legitimate_user_123/watchHistory/some_log`
* **Attacking UID**: `hacker_999`
* **Payload**:
```json
{
  "videoId": "random_ads_channel",
  "watchedAt": "2026-05-21T11:00:00Z",
  "progress": 30
}
```
* **Failure Outcome**: Blocked since `/users/{userId}/watchHistory/{id}` allows writes only if `request.auth.uid == userId`.

### Threat Vector 12: Illegal Modification of Video Category Whitelist
* **Goal**: Injecting spam content in categories or re-categorizing public videos.
* **Target Path**: `/videos/sintel`
* **Attacking UID**: `hacker_999`
* **Payload**:
```json
{
  "category": "spam_links"
}
```
* **Failure Outcome**: Locked out. The user doesn't own Sintel and isn't an admin.
