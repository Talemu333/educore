# EduProw Multi-School Database Migration

## Objective

EduProw is being prepared for a database-per-school architecture while preserving the current shared-database deployment during the transition.

The target architecture is:

```text
EduProw Central Database
├── schools
├── school_database_configs
├── authentication / platform identity
├── roles and permissions
├── domains / tenant resolution
├── subscriptions / platform configuration
└── Partner Programme

School Database A
├── students
├── teachers / school profiles
├── parents
├── classes / arms
├── subjects / class subjects
├── attendance
├── sessions / terms
├── results / grading
├── payments / fees
├── expenses
├── announcements / notifications
├── timetable
├── school website content
└── CBT data
```

## Migration bridge

`server/config/schoolDatabaseManager.js` resolves a school's database from `school_database_configs`.

During migration, schools with `status = 'shared'` continue using the existing central database. A school only uses a dedicated database when its registry row is changed to `status = 'active'` and points to its dedicated database.

This allows individual modules to become database-aware before any school is actually moved.

## Request context

`server/middlewares/schoolDatabaseContext.js` resolves the current school database and exposes it as:

```js
req.schoolDatabase
req.schoolDatabaseSchoolId
```

The middleware is intentionally mounted only on modules that have completed their dependency audit. It must not be mounted globally until authentication, tenant resolution, and central-data access rules are finalized.

## Safe migration rule

A module may use `req.schoolDatabase` only when all SQL operations performed by that module are compatible with the target database.

In particular, avoid SQL joins such as:

```sql
JOIN users ...
JOIN schools ...
JOIN school_settings ...
```

if those tables will remain in the central database. PostgreSQL cannot perform an ordinary join across two separate databases through the existing pool abstraction.

Instead, either:

1. move the dependency into the same school database,
2. keep the dependent data central and retrieve it through a separate central service/query, or
3. postpone activation of the module until its ownership boundary is resolved.

## Current pilot modules

The following modules have already been prepared as database-aware migration pilots:

- Announcements
- Notifications
- Contact messages
- Class / arm access
- Subject / class-subject access where the existing dependency boundary permits it

They continue to work against the current shared database because the resolver falls back to the central pool for schools whose registry status is `shared`.

## Foundational tables that should remain central for now

- `schools`
- `school_database_configs`
- authentication and platform identity
- roles / permissions
- tenant/domain resolution
- `school_settings` until its dependencies are separated

`users` is a particularly important boundary. Its school-scoped records should eventually be decomposed into central identity data and school-specific profile data rather than blindly copying the entire current table into every school database.

## Modules intentionally postponed

### Students

Student operations currently depend on classes, arms, academic sessions/enrolment data and parent/user relationships. The student service also performs transactions involving admission-number generation and enrolments. It should not be activated against a dedicated school database until those dependencies have been assigned clear ownership.

### Teachers

Teacher records depend on user identity and other reference data. The ownership boundary must be finalized before activation.

### Expenses

Expenses currently depend on `school_settings` and user information. Moving the expense table before those dependencies are resolved would introduce cross-database joins.

### Departments

Departments currently do not have a `school_id` and appear to be global/reference data. Their ownership must be decided before migration.

### Payments / results / attendance / CBT

These are high-dependency modules and should be migrated only after the foundational student, user/profile, session, class and academic-record boundaries are stable.

## Recommended migration order

1. Central database registry and database resolver — complete.
2. Request-level school database context — complete.
3. Small, self-contained modules — pilots complete.
4. Finalize central identity vs school profile ownership.
5. Finalize reference-data ownership (departments, sessions, terms, grading configuration).
6. Prepare classes, subjects and enrolment dependencies.
7. Migrate students and parents together with their required school-owned dependencies.
8. Migrate teachers and school staff profiles.
9. Migrate attendance, results, promotion and academic records.
10. Migrate fees, payments and expenses.
11. Migrate CBT and other high-dependency modules.
12. Add dedicated-database provisioning and school-by-school cutover.
13. Only after the cloud architecture is stable, introduce the offline local database and synchronization layer.

## Offline-first requirement

The future offline architecture should not be implemented as a separate feature bolted onto the current shared database. The school database boundary should become the cloud synchronization boundary.

Each school installation should eventually have:

```text
Local school database
       │
       │ sync queue / change log
       ▼
School cloud database
       │
       ▼
EduProw central platform services
```

Offline synchronization will require stable IDs, timestamps/versioning, idempotent operations and explicit conflict rules. Financial records, attendance, results and CBT attempts require particularly careful conflict handling.

## Important constraint

Do not activate a school database simply because a table has a `school_id` column. The entire dependency graph of that module must first be compatible with the target database.
