# Security Spec - Horario Escolar

## Data Invariants
1. A subject, session, or task must always belong to the authenticated user.
2. The `ownerId` in the data must match the `request.auth.uid`.
3. IDs must be valid strings.
4. Tasks and Sessions must reference a `subjectId`.

## The Dirty Dozen Payloads
1. Attempt to create a subject with someone else's `ownerId`.
2. Attempt to read another user's subjects by guessing their `userId`.
3. Attempt to update a subject with a 1MB string in the `name` field.
4. Attempt to delete another user's task.
5. Attempt to create a task without a `title`.
6. Attempt to inject scripts/HTML into the `description` field.
7. Attempt to update `ownerId` of an existing document.
8. Attempt to create a session with an invalid `dayOfWeek` (e.g., 99).
9. Attempt to create a document with a junk character string as ID.
10. Attempt to list all users' tasks.
11. Attempt to bypass auth by sending a request without a token.
12. Attempt to change `completed` status of another user's task.
