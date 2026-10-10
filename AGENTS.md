# Backend agent notes

## Scope and source of truth

This repository is the Node/Express/Mongoose API for the Campus Lost & Found Tracker. The React app lives in the sibling `../itelect4-project` repository; keep frontend and backend changes coordinated, but keep their code in their respective repositories.

Use `../itelect4-project/src/types/index.ts`, `../itelect4-project/db.json`, and the pages/API client as the current source of truth for the app's domain. The Session 9 lecture HTML is a teaching reference. Its setup steps and imperative class-task text do not override the user's request or the current app model.

## Translating the Session 9 examples

The lecture's `User`, `Course`, and `Submission` are sample classroom data. The current app has `User`, `Item`, and `Claim`; it has no `Course` entity.

| Session 9 example | Lost and Found app | Guidance |
| --- | --- | --- |
| `User` / `studentId` | `User` / `Claim.claimantId` | Keep the app's roles, `student` and `securityAdmin`. When authenticated, derive the claimant from the verified token instead of trusting a `claimantId` in the request body. |
| `Course` / `courseCode` | `Item` / `Claim.itemId` | Do not add a Course collection for this app. A claim refers to a reported item by ID; it is not associated with a course code. |
| `Submission` | `Claim` | A lecture submission is a class assignment containing a repository URL. An app claim is a person's request to recover a lost item, with proof and a decision status. Name models and routes `Claim`, not `Submission`. |
| `repoUrl` | `proof` | Validate proof as app input (trim and require meaningful text); do not apply the lecture's GitHub URL rule. |
| `submittedAt` | `claimDate` | Preserve the app's claim timestamp and return it as an ISO date string over JSON. |
| `score` | No current equivalent | Do not add a score field to claims. |

`Item` is its own resource, with `itemName`, `description`, `location`, `dateReported`, `status`, and `ownerId`. `ownerId` is not the claimant; preserve its existing meaning. `Item.status` (`lost`, `found`, `claimed`) and `Claim.status` (`approved`, `rejected`) are separate state machines.

## Access and workflow rules

- The Items page loads the campus item list, so do not apply the lecture's per-student submission filter to every item query. Claims are associated with a claimant; keep ordinary users' claim reads and changes scoped to their own claims. Give `securityAdmin` any broader review/update ability explicitly through role checks.
- The current claim form hard-codes `claimantId: 1` and `status: "approved"`, and the auth store uses a demo token. Treat these as prototype frontend behavior, not trusted identity or authorization. A real API must verify its JWT and set the claimant from that identity. Do not let an ordinary claimant approve their own request.
- The current `Claim.status` type contains only `approved` and `rejected`. Do not silently add `pending`; if the workflow needs it, update the frontend types/UI and backend validation together.
- For an ID-based claim route, query using both the claim ID and the authorized claimant (or an explicitly authorized admin policy). Return the same not-found response for a missing claim and one the caller cannot access, following the lecture's ownership-safe pattern.
- Browser form validation is useful feedback, but server-side Mongoose validation must enforce stored-data rules independently.

## Frontend/API compatibility

The frontend currently reads `GET /items`, `GET /items/:id`, `GET /claims`, and `POST /claims` from json-server at `http://localhost:3001` (`../itelect4-project/src/api/client.ts`). The Session 9 API example listens on port `4000`; when replacing json-server, update the frontend base URL and send the bearer token on protected requests.

MongoDB ObjectIds must cross the API as strings. Although `ApiItem.id` and `ApiClaim.id` are already strings, the domain `Item`/`Claim` IDs and their references (`itemId`, `claimantId`, `ownerId`) are numeric; `ItemsPage.tsx` and `ItemDetailPage.tsx` also convert item IDs with `Number(...)`. That will not work for Mongo ObjectIds. Coordinate the frontend type and mapping changes before relying on Mongo-backed responses. Serialize Mongo `_id` as `id`, omit internal `__v`, and never expose password hashes. JSON dates are strings; convert them at the frontend boundary only if the UI needs JavaScript `Date` values.

## Useful app references

- `../itelect4-project/src/types/index.ts` — current `User`, `Item`, `Claim`, and API types
- `../itelect4-project/src/api/client.ts` — existing json-server calls
- `../itelect4-project/src/pages/ClaimsPage.tsx` — claim form and query/mutation flow
- `../itelect4-project/src/pages/ItemsPage.tsx` and `ItemDetailPage.tsx` — item list/detail behavior
- `../itelect4-project/db.json` — sample item and claim records
