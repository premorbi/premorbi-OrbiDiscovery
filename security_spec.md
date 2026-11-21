# Security Specification — Orbi Smart Home Customer Discovery

## 1. Data Invariants
1. **Authenticated & Verified Identity**: Only signed-in users with `request.auth.token.email_verified == true` may read or write records.
2. **PII Isolation**: `/discoveries/{briefId}` stores customer PII (`customerName`, `customerPhone`, `customerEmail`, `area`). `get` and `list` are strictly limited to the document owner (`resource.data.ownerId == request.auth.uid`) or a verified Orbi Admin (`isAdmin()`).
3. **Owner Immutability & Initial Status Enforcement**: On `create`, `ownerId` must equal `request.auth.uid`, `status` must start as `'new'` (unless created by an admin), `advisorNotes` must be empty `''` for non-admins, and `createdAt == request.time && updatedAt == request.time`.
4. **Terminal State Locking**: Once a discovery brief reaches `'won'` or `'archived'`, non-admin owners cannot mutate it.
5. **Action-Based Updates & Strict Field Allowlisting**: Updates are partitioned into Owner Edit (`affectedKeys().hasOnly(...)` excluding `ownerId`, `createdAt`, `status`, `advisorNotes`) and Admin Pipeline Update (`isAdmin()`).
6. **Admin Directory Protection**: Only bootstrapped root admin (`prem455@gmail.com` with `email_verified == true`) or existing admins in `/admins/{uid}` may read or manage `/admins`. Non-admins cannot self-assign admin privileges.

## 2. Dirty Dozen Attack Payloads (Expected: PERMISSION_DENIED)
1. **Unauthenticated Create**: Create `/discoveries/brief1` without `request.auth` -> DENIED.
2. **Unverified Email Create**: Create `/discoveries/brief1` with `email_verified: false` -> DENIED.
3. **Identity Spoofing**: User A creates `/discoveries/brief1` with `ownerId: "userB"` -> DENIED.
4. **Status Escalation on Create**: Non-admin user creates `/discoveries/brief1` with `status: "won"` -> DENIED.
5. **Shadow / Ghost Field Injection**: Create `/discoveries/brief1` with extra field `isVip: true` -> DENIED (`hasOnly` check).
6. **ID Poisoning**: Create `/discoveries/bad$id..` or 200-char ID -> DENIED (`isValidId`).
7. **Timestamp Forgery**: Create `/discoveries/brief1` with client `createdAt` instead of `request.time` -> DENIED.
8. **Cross-User PII Read**: User B attempts `get` on User A's `/discoveries/brief1` -> DENIED.
9. **Blanket List Query**: Non-admin user runs `list` on `/discoveries` without `where('ownerId', '==', uid)` -> DENIED (`resource.data.ownerId == request.auth.uid`).
10. **Owner Mutating Pipeline Status**: User A attempts `update` changing `status: "quoted"` or `advisorNotes: "approved"` -> DENIED.
11. **Terminal State Tampering**: User A attempts `update` on a brief whose `status == "won"` -> DENIED.
12. **Self-Admin Privilege Escalation**: Non-admin user attempts `create` on `/admins/{ownUid}` -> DENIED.
