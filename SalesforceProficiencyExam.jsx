import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";

/* ============================================================================
   SALESFORCE PROFICIENCY EXAM
   Categories mirror the domain structure used across Salesforce's Admin,
   Advanced Admin, Platform Developer, and Integration credential blueprints,
   broadened to cover the full platform. Answers are 0-indexed.
   ==========================================================================*/

const CATEGORIES = {
  FUND:     { label: "Platform Fundamentals & Navigation", short: "Fundamentals" },
  UMA:      { label: "User Management & Access",           short: "User Mgmt" },
  SEC:      { label: "Security & Data Access",             short: "Security" },
  MODEL:    { label: "Data Modeling & Relationships",      short: "Data Model" },
  DMGMT:    { label: "Data Management",                    short: "Data Mgmt" },
  AUTO:     { label: "Process Automation",                 short: "Automation" },
  SALES:    { label: "Sales Applications",                 short: "Sales" },
  SERVICE:  { label: "Service Applications",               short: "Service" },
  ANALYTICS:{ label: "Reports, Dashboards & Analytics",    short: "Analytics" },
  PROD:     { label: "Productivity & Collaboration",       short: "Productivity" },
  DEV:      { label: "Custom Development (Apex/LWC/SOQL)",  short: "Development" },
  INT:      { label: "Integration & APIs",                 short: "Integration" },
  DEPLOY:   { label: "Deployment & Lifecycle",             short: "Deployment" },
};

// Ascending prestige. Threshold = minimum overall % to earn the tier.
const TIERS = [
  { min: 90, name: "World-Class Admin",  color: "amber",
    blurb: "Architect-level fluency across the entire Salesforce ecosystem — configuration, code, data, and integration all sit within command." },
  { min: 75, name: "Advanced Admin",     color: "violet",
    blurb: "Deep command of the platform, including the development and integration edges most admins never reach." },
  { min: 60, name: "Proficient Admin",   color: "indigo",
    blurb: "Confident across configuration, automation, and data. Handles the large majority of requests independently." },
  { min: 45, name: "Competent Admin",    color: "teal",
    blurb: "Solid on the fundamentals and ready for day-to-day administration, with supervision on the harder edges." },
  { min: 25, name: "Casual User",        color: "sky",
    blurb: "Comfortable navigating and using the platform, but the administrative and structural foundations have real gaps." },
  { min: 0,  name: "Total Novice",       color: "slate",
    blurb: "Just getting oriented. Core platform concepts are still forming — a great place to start building." },
];

const F = "Foundational", I = "Intermediate", A = "Advanced";

const QUESTIONS = [
  {c:"FUND",d:"Foundational",q:"What is the primary purpose of the App Launcher (the grid/waffle icon) in Lightning Experience?",o:[
    "Switch between Salesforce apps and open any tab, object, or item not pinned to the current nav bar",
    "Browse, install, and configure packages from the AppExchange and complete their post-install setup steps",
    "Reset another user's password and unlock accounts after too many failed login attempts",
    "Personalize the color theme and branding shown across the current Lightning application"
  ],a:0,e:"The App Launcher lets users move between apps and reach any tab, object, or item they have access to, even when it isn't pinned on the current app's navigation bar."},
  {c:"FUND",d:"Foundational",q:"Which environment is a free, full-featured org intended for building and testing rather than running a company's production data?",o:[
    "Developer Edition, a free fully-featured org meant for building and testing rather than production",
    "Enterprise Edition, a paid production org with advanced customization and broad API access",
    "Partial Copy Sandbox, a refreshable environment seeded with a sampled subset of production data",
    "Trailhead Playground, a personal org tied to your Trailhead profile for hands-on challenges"
  ],a:0,e:"Developer Edition is a free, fully-featured org meant for development and learning. It is not licensed to run a business's live/production operations."},
  {c:"FUND",d:"Foundational",q:"Where does an administrator go to configure objects, fields, users, and automation?",o:[
    "The Reports tab, where administrators build, schedule, and export logs of all configuration changes",
    "The Chatter feed, where admins post configuration changes for other admins to approve",
    "Setup, the central administrative area reached from the gear icon, for configuration and metadata",
    "The Developer Console, used mainly to write and debug Apex, SOQL, and Lightning code"
  ],a:2,e:"Setup, reached from the gear icon, is the central administrative area for configuration and metadata."},
  {c:"FUND",d:"Foundational",q:"A Lightning app is best described as:",o:[
    "A single custom object together with all of its fields, page layouts, and record types",
    "A collection of items and tabs, branded and grouped with a navigation bar for a set of users",
    "An Apex class paired with a Visualforce page that renders a custom user interface",
    "A packaged set of reports and dashboards shared to a folder for a group of users"
  ],a:1,e:"A Lightning app groups a navigation bar of tabs/items, branding, and utility items tailored to a group of users."},
  {c:"FUND",d:"Intermediate",q:"Which capability is available in Lightning Experience but NOT in Salesforce Classic?",o:[
    "The Lightning App Builder, a drag-and-drop page builder that also supports Dynamic Forms",
    "Creating and editing custom objects, fields, and their relationships in Object Manager",
    "Building reports and dashboards from standard and custom report types",
    "Defining standard and custom list views with filters on an object's records"
  ],a:0,e:"The Lightning App Builder (drag-and-drop page building, including Dynamic Forms) is a Lightning-only tool. Classic uses page layouts only."},
  {c:"FUND",d:"Foundational",q:"The Kanban view on an object such as Opportunity primarily lets users:",o:[
    "Drag records between columns representing a picklist such as Stage to update that field",
    "Build trigger logic visually by dragging elements onto a canvas without writing Apex",
    "Identify and merge duplicate records that share the same name or email address",
    "Schedule reports and dashboards for recurring email delivery to a list of users"
  ],a:0,e:"Kanban visualizes records grouped by a picklist and lets users drag a record to a new column to update that field."},
  {c:"FUND",d:"Foundational",q:"What is Trailhead?",o:[
    "Salesforce's scheduled data backup service that exports org data on a weekly basis",
    "A tool for finding and merging duplicate account, contact, and lead records",
    "Salesforce's free, gamified online learning platform with modules, trails, and challenges",
    "The customizable navigation bar used by the Salesforce mobile app on phones"
  ],a:2,e:"Trailhead is Salesforce's guided, hands-on learning platform with modules, trails, and hands-on challenges."},
  {c:"FUND",d:"Intermediate",q:"From a Lightning list view, which action can a user perform directly (with the right permissions)?",o:[
    "Deploy metadata such as fields and layouts from a sandbox to the production org",
    "Author a validation rule that blocks saves when its formula evaluates to true",
    "Inline-edit fields and mass-update multiple selected records right from the list",
    "Create a permission set and assign it to the records shown in the list view"
  ],a:2,e:"List views support inline editing and mass actions/updates on multiple selected records, plus filtering and charts."},
  {c:"FUND",d:"Foundational",q:"Global Search in Salesforce searches:",o:[
    "Only the object that is currently open, matching on its name and description fields alone",
    "Only reports and dashboards stored in folders the user is allowed to view",
    "Only Setup menu items, returning configuration pages rather than records",
    "Across many objects and records the user has access to, not just the current object"
  ],a:3,e:"Global search indexes and returns records across searchable objects the user can access, not just the current object."},
  {c:"FUND",d:"Intermediate",q:"In Lightning Experience, what determines which tabs appear in an app's navigation bar by default?",o:[
    "The user's role in the hierarchy, which lists tabs for everyone below them",
    "The user's manager, who selects which tabs appear for their direct reports",
    "The Recycle Bin settings, which hide tabs for recently deleted objects",
    "The Lightning app's assigned navigation items, subject to each user's own access"
  ],a:3,e:"An app defines its navigation items; users see those they have access to and can personalize the bar if allowed."},
  {c:"FUND",d:"Intermediate",q:"The 'Favorites' (star) feature in Lightning Experience lets a user:",o:[
    "Grant another user temporary read access to the record being viewed",
    "Flag the current record as a duplicate so it can be merged later",
    "Lock a record from further editing until a manager approves changes",
    "Bookmark records, list views, and pages for quick one-click access later"
  ],a:3,e:"Favorites bookmark records, list views, groups, and other pages for one-click return access."},
  {c:"FUND",d:"Foundational",q:"What is an 'org' in Salesforce terminology?",o:[
    "A public group of users bundled together for use in sharing rules",
    "A single deployed instance of Salesforce with its own data, users, and configuration",
    "A required standard field that stores the company or organization name on every Account",
    "A folder that organizes reports and dashboards for a team to share"
  ],a:1,e:"An org (organization) is one instance of Salesforce — its own set of users, data, and customizations."},
  {c:"FUND",d:"Intermediate",q:"Which statement about the Salesforce mobile app is correct?",o:[
    "It requires a separate license and cannot reuse any of the org's existing configuration",
    "It runs on the same org configuration and can present compatible Lightning pages and flows",
    "It functions only in Salesforce Classic and ignores Lightning pages entirely",
    "It can display standard objects but is unable to show any custom objects"
  ],a:1,e:"The Salesforce mobile app runs on the same org configuration and can present compatible Lightning pages, components, and flows."},
  {c:"UMA",d:"Foundational",q:"How many profiles can a single user be assigned at one time?",o:[
    "Up to two, so a user can combine a base profile with a secondary one",
    "Unlimited, letting admins stack as many profiles as the role requires",
    "One per app, so the profile changes as the user switches applications",
    "Exactly one, with any extra access granted through permission sets on top"
  ],a:3,e:"Every user has exactly one profile. Additional access beyond the profile is granted through permission sets."},
  {c:"UMA",d:"Foundational",q:"What is the primary purpose of a permission set?",o:[
    "Restrict a user's record visibility below the org-wide default for an object",
    "Grant additional permissions to specific users without changing their profile",
    "Assign a user to a position in the role hierarchy for record sharing",
    "Provision a new sandbox and copy the user's access into that environment"
  ],a:1,e:"Permission sets extend a user's access (permissions, object/field access, apps) on top of their profile; users can have many."},
  {c:"UMA",d:"Intermediate",q:"What does a user's ROLE primarily control?",o:[
    "Which apps, tabs, and objects the user is permitted to open, use, and edit across the org",
    "The password policy and login hours enforced when the user signs in",
    "Record-level visibility through the role hierarchy, so managers see subordinates' records",
    "Which Apex classes and triggers are allowed to run for that user"
  ],a:2,e:"Roles drive record access via the role hierarchy (managers can see subordinates' records). They do not grant functional permissions like CRUD or app access."},
  {c:"UMA",d:"Intermediate",q:"A permission set group is used to:",o:[
    "Group multiple users together so that they can be referenced collectively within a single sharing rule",
    "Organize related reports and dashboards into a folder shared with a team",
    "Combine several permission sets into one assignable bundle, optionally muting specific permissions",
    "Bundle scheduled batch jobs so they run together in one asynchronous transaction"
  ],a:2,e:"Permission set groups bundle permission sets for streamlined assignment; a muting permission set can remove specific permissions from the group."},
  {c:"UMA",d:"Foundational",q:"In Salesforce, an administrator who no longer wants a user to have access should generally:",o:[
    "Delete the user record permanently so the license is released immediately",
    "Deactivate or freeze the user, since user records cannot be deleted from an org",
    "Blank out the user's email address so the system can no longer notify them",
    "Remove all of the user's reports and dashboards to cut off their access"
  ],a:1,e:"User records can't be deleted, only deactivated. Deactivating frees the license; freezing blocks login immediately while records are reassigned."},
  {c:"UMA",d:"Intermediate",q:"What is the difference between FREEZING and DEACTIVATING a user?",o:[
    "They are functionally identical and differ only in the label shown in Setup",
    "Freezing deletes the user record entirely, while deactivating archives it for a later restore",
    "Freezing blocks login instantly but keeps the license; deactivating blocks access and frees it",
    "Only deactivation stops login; freezing merely hides the user from list views"
  ],a:2,e:"Freezing is an instant stop-gap that still holds the license (useful while reassigning records). Deactivation releases the license."},
  {c:"UMA",d:"Foundational",q:"A user LICENSE primarily determines:",o:[
    "The baseline set of features and functionality a user is entitled to use",
    "The user's specific position within the org's role hierarchy for sharing",
    "Which sharing rules apply to the records that the user happens to own",
    "The color theme and branding the user sees across their Lightning apps"
  ],a:0,e:"The user license sets the foundational functionality available; profiles and permission sets then grant specific access within that license."},
  {c:"UMA",d:"Intermediate",q:"Login IP ranges and login hours are configured on which of the following?",o:[
    "Roles, which set the hours and network ranges allowed for everyone below them",
    "Public groups, whose membership determines the collective login window for users",
    "Report folders, which restrict the times their reports can be run or exported",
    "Profiles, which define login hours and IP ranges that limit when and where users log in"
  ],a:3,e:"Profiles define login hours and login IP ranges that restrict when and from where users can access the org."},
  {c:"UMA",d:"Advanced",q:"Delegated administration allows you to:",o:[
    "Bypass all sharing rules so a support team can view every record in the org",
    "Grant the Modify All Data permission to every user who needs broad access",
    "Give non-admins limited rights to manage specified users and certain custom objects",
    "Automatically deploy change sets from sandbox to production on a set schedule"
  ],a:2,e:"Delegated admin groups let you assign narrow admin tasks (e.g., managing certain roles' users or specific objects) without full System Administrator access."},
  {c:"UMA",d:"Intermediate",q:"Which of these can OWN records such as cases or leads?",o:[
    "A queue, which holds records like cases or leads for members to take from a shared pool",
    "A public group, whose members automatically become co-owners of shared records",
    "A permission set, which assigns ownership of records to everyone it is granted to",
    "A report folder, which owns the records surfaced by the reports stored inside it"
  ],a:0,e:"Queues can own records (cases, leads, custom objects) so members can pull work from a shared pool. Public groups are used in sharing, not ownership."},
  {c:"UMA",d:"Foundational",q:"Salesforce requires which of the following for user logins?",o:[
    "A physical hardware security key issued to and registered for every single user",
    "A dedicated corporate VPN connection that all users must route their traffic through",
    "A password reset performed by every user at the start of each work week",
    "Multi-factor authentication (MFA) as a baseline requirement for direct UI logins"
  ],a:3,e:"Salesforce mandates MFA for direct UI logins as a baseline security requirement."},
  {c:"UMA",d:"Intermediate",q:"Broadly, which pairing correctly maps 'what a user can DO' vs 'what a user can SEE'?",o:[
    "Profiles and permission sets govern what a user can do; roles and sharing govern what they see",
    "Roles govern what a user can do, while profiles govern what records they can see",
    "Sharing rules govern what a user can do, while profiles govern what they can see",
    "Queues govern what a user is able to do, while licenses govern which records they are able to see"
  ],a:0,e:"Profiles and permission sets grant functional/object/field permissions (do). Roles and sharing settings govern record visibility (see)."},
  {c:"UMA",d:"Advanced",q:"The 'Login Access' / 'Log in as' capability lets an administrator (when granted):",o:[
    "Reset the org's data encryption keys so that support engineers can decrypt a specific user's records",
    "Permanently reassign a user's records to an administrator for safekeeping",
    "Change the org's underlying Salesforce edition to unlock additional features",
    "Access the app as another user to troubleshoot, based on granted access or an admin permission"
  ],a:3,e:"Admins can log in as a user (users can grant access, or an org setting/permission allows it) to reproduce and troubleshoot issues."},
  {c:"UMA",d:"Intermediate",q:"Which object permission lets a user view every record of an object regardless of sharing settings?",o:[
    "Edit, which lets a user change any record they can already see on the object",
    "View All, which grants read access to every record of the object, bypassing sharing",
    "Read, which shows only the records shared to the user through normal sharing",
    "Create, which lets a user add new records but not see everyone else's records"
  ],a:1,e:"'View All' grants visibility to all records of an object, bypassing sharing. 'Modify All' additionally allows editing/deleting them."},
  {c:"UMA",d:"Advanced",q:"You need 20 users to gain access to a new custom app and a custom object, but their profiles must stay unchanged. The best approach is to:",o:[
    "Create a permission set with the needed access and assign it to the twenty users",
    "Edit each of the users' profiles individually to add the app and object access",
    "Change the org-wide default for the object so all users can reach the records",
    "Assign the System Administrator profile to the twenty users who need the access"
  ],a:0,e:"Permission sets are the standard, scalable way to grant additional access to a subset of users without altering shared profiles."},
  {c:"SEC",d:"Intermediate",q:"Org-Wide Defaults (OWD) establish:",o:[
    "The most permissive record access, which sharing rules later tighten per object",
    "The baseline, most restrictive level of record access, which sharing then opens up",
    "Which fields appear on a given page layout for each record type and profile",
    "The profile each user is assigned and the permissions that come with it"
  ],a:1,e:"OWD sets the baseline record access. Every other sharing mechanism can only open access further, never restrict below the OWD."},
  {c:"SEC",d:"Intermediate",q:"A key rule about sharing rules is that they can:",o:[
    "Only grant, opening access beyond the OWD, and never restrict access a user has",
    "Both grant and remove record access depending on how the criteria are written",
    "Restrict field-level security so certain profiles lose visibility to a field",
    "Delete records automatically once they no longer meet the sharing criteria"
  ],a:0,e:"Sharing rules are additive: they extend access above the org-wide default. They cannot revoke access a user already has."},
  {c:"SEC",d:"Intermediate",q:"Which OWD setting means a child record's access is determined entirely by its parent?",o:[
    "Public Read/Write, which lets every user view and edit all of the records",
    "Private, which limits each record strictly to its owner and the role hierarchy",
    "Public Read Only, which lets all users view but only the owner edit records",
    "Controlled by Parent, which ties the child's access entirely to its parent record"
  ],a:3,e:"'Controlled by Parent' ties the child's access to the parent record — the default and only option for the detail side of a master-detail relationship."},
  {c:"SEC",d:"Intermediate",q:"Field-Level Security (FLS) does which of the following?",o:[
    "Controls the order and grouping in which fields are arranged within each section of a page layout",
    "Controls whether a user can view or edit a field, hiding it from reports and the API when removed",
    "Sets the org-wide default sharing level for every record of the object",
    "Defines a validation rule that blocks the save when a field is left blank"
  ],a:1,e:"FLS governs read/edit access to a field. If FLS hides a field, it's not visible on layouts, reports, list views, search, or the API."},
  {c:"SEC",d:"Advanced",q:"A field is on the page layout but a user still can't see it. The MOST likely cause is:",o:[
    "A validation rule on the field is silently suppressing it from the layout",
    "The record is sitting in the Recycle Bin, so its fields are hidden from view",
    "Field-Level Security hides the field for that user's profile or permission set",
    "The user has no role, which removes field access until a role is assigned"
  ],a:2,e:"Page layout controls arrangement; FLS controls access. FLS overrides layout, so a hidden field won't appear even if it's on the layout."},
  {c:"SEC",d:"Advanced",q:"The 'Grant Access Using Hierarchies' setting means:",o:[
    "Managers see records owned by users below them; for standard objects it is always on",
    "Every user in the org can see every record regardless of ownership or role",
    "Records are automatically shared outward with external community and portal users",
    "The org-wide default is ignored entirely once a role hierarchy is defined"
  ],a:0,e:"Role-hierarchy access lets managers see subordinates' records. It's always enabled for standard objects; for custom objects it can be disabled."},
  {c:"SEC",d:"Advanced",q:"Manual sharing (the 'Share' button) is available on a record only when:",o:[
    "The OWD is more restrictive than Public Read/Write, such as Private or Public Read Only",
    "The OWD is set to Public Read/Write so anyone can already edit the record",
    "The record's owner has been deactivated and the record needs a new owner",
    "The object has no custom fields defined, leaving only its standard fields available to share out"
  ],a:0,e:"Manual sharing appears when the sharing model is restrictive enough that granting extra access to specific users/groups is meaningful."},
  {c:"SEC",d:"Advanced",q:"Which permission lets a user read, edit, and delete ALL records of ALL objects, bypassing sharing?",o:[
    "View All Data, which grants read access to everything but not edit or delete",
    "Modify All Data, an org-wide permission that overrides sharing and object restrictions",
    "Manage Users, which lets an admin create and edit users but not their records",
    "Customize Application, which allows metadata changes but not record-level access"
  ],a:1,e:"'Modify All Data' is an org-wide super permission that overrides sharing and object-level restrictions. 'View All Data' is read-only equivalent."},
  {c:"SEC",d:"Advanced",q:"Restriction rules (a newer security feature) are used to:",o:[
    "Grant a user additional record access layered on top of existing sharing rules",
    "Encrypt sensitive fields at rest so their values are unreadable in the database",
    "Define the login IP ranges from which a profile's users are allowed to sign in",
    "Filter down the records a user would otherwise be able to see on a given object"
  ],a:3,e:"Restriction rules narrow the set of records a user can access on an object, layering on top of the existing sharing model to tighten visibility."},
  {c:"SEC",d:"Intermediate",q:"Salesforce Health Check is a tool that:",o:[
    "Monitors server uptime and alerts admins when the Salesforce instance is down",
    "Runs all Apex unit tests and reports the org's overall code coverage percentage",
    "Creates scheduled backup exports of the org's data for disaster recovery",
    "Scores your org's security settings against a baseline and flags risky configurations"
  ],a:3,e:"Health Check compares security-related settings (password policies, sessions, etc.) to a baseline and highlights high-risk configurations."},
  {c:"SEC",d:"Advanced",q:"In a master-detail relationship, the security/sharing of the detail (child) record is:",o:[
    "Set independently on the child, with its own org-wide default and sharing rules",
    "Always Private, restricting each detail record to its owner and their managers",
    "Controlled only by permission sets granted directly to each individual user",
    "Inherited from the master parent record, so the child cannot set its own OWD"
  ],a:3,e:"Detail records inherit ownership and sharing from their master; you can't set the child's OWD independently."},
  {c:"SEC",d:"Intermediate",q:"Which two mechanisms together control OBJECT-level access (CRUD)?",o:[
    "The role hierarchy and sharing rules, which open record access across the org",
    "Org-wide defaults and manual sharing, which set and extend record visibility",
    "Profiles and permission sets, which grant object Create, Read, Edit, and Delete",
    "Queues and public groups, which route ownership and bundle users for sharing"
  ],a:2,e:"Object-level Create/Read/Edit/Delete is granted through profiles and permission sets, independent of record-level sharing."},
  {c:"SEC",d:"Advanced",q:"Shield Platform Encryption differs from classic encrypted text fields in that it:",o:[
    "Works only in sandboxes and cannot be enabled in a live production environment",
    "Prevents the encrypted values from ever being searched, sorted, filtered, or reported on anywhere in the org",
    "Comes switched on by default in every org without any additional licensing",
    "Encrypts data at rest across many standard and custom fields and files, preserving more functionality"
  ],a:3,e:"Shield Platform Encryption is an add-on that encrypts data at rest across a broad range of fields/files while retaining more functionality than the legacy encrypted-text field type."},
  {c:"SEC",d:"Intermediate",q:"Criteria-based sharing rules share records based on:",o:[
    "Share records based only on their current owner's position within the org's role hierarchy",
    "Share records depending on the login IP address of the user viewing them",
    "Share records whose field values match specified criteria, regardless of who owns them",
    "Share records according to the report folder in which they are referenced"
  ],a:2,e:"Criteria-based sharing rules open access to records whose field values meet defined conditions, regardless of owner."},
  {c:"SEC",d:"Advanced",q:"Session settings such as session timeout and 'lock sessions to the IP address they originated from' are configured:",o:[
    "On each individual report, controlling how long its results stay cached",
    "In Setup under Session Settings, org-wide, with some profile-level overrides possible",
    "On the role hierarchy, where each individual role sets its own session timeout and IP rules",
    "In the App Launcher, alongside the list of apps available to the user"
  ],a:1,e:"Session Settings in Setup control timeout, IP locking, and related session security, with some profile-level overrides."},
  {c:"SEC",d:"Intermediate",q:"The correct top-to-bottom order of record-access layers (most restrictive baseline first) is:",o:[
    "Sharing rules first, then the OWD baseline, then the role hierarchy on top",
    "Manual sharing first, then the OWD baseline, then the profiles that are assigned to each user",
    "OWD baseline, then role hierarchy, then sharing rules, then manual and other sharing",
    "Profiles first, then the OWD, then queues that own the records in question"
  ],a:2,e:"Access starts at the OWD baseline, then is progressively opened by the role hierarchy, sharing rules, and manual/programmatic sharing."},
  {c:"MODEL",d:"Intermediate",q:"Which relationship type is 'tightly coupled', cascades delete from parent to child, and enables roll-up summary fields?",o:[
    "Lookup, a loosely coupled link whose child keeps its own owner and sharing settings",
    "Master-detail, where the child inherits sharing, is deleted with the parent, and enables roll-ups",
    "Hierarchical, a self-referencing lookup used to relate a record to another record of the same kind",
    "External lookup, which points a child record to a row in an external data source"
  ],a:1,e:"Master-detail tightly links child to parent: the child inherits owner/sharing, is deleted when the parent is, and supports roll-up summaries on the parent."},
  {c:"MODEL",d:"Intermediate",q:"A roll-up summary field can be created on:",o:[
    "The master parent side of a master-detail relationship, summarizing its child records",
    "Any object that has a lookup relationship pointing to a related parent object",
    "Only the User object, rolling up activity from the records that user owns",
    "Any two unrelated objects, aggregating values across them without a relationship"
  ],a:0,e:"Standard roll-up summary fields (COUNT/SUM/MIN/MAX) require a master-detail relationship and live on the master object."},
  {c:"MODEL",d:"Advanced",q:"To model a many-to-many relationship between two objects, you typically create:",o:[
    "A junction object joined to both objects through two master-detail relationships",
    "Two lookup fields placed on one of the objects, each pointing to the other",
    "A single hierarchical relationship linking the two objects through the User object",
    "A formula field that concatenates the record IDs from both related objects"
  ],a:0,e:"A junction (bridge) object with two master-detail relationships to the two objects implements many-to-many."},
  {c:"MODEL",d:"Intermediate",q:"A lookup relationship differs from master-detail in that a lookup:",o:[
    "It is loosely coupled: the child can exist without a parent and keeps its own sharing",
    "It always deletes the child records automatically when the parent is removed",
    "It requires a junction object to sit between the parent and the child records",
    "It cannot be reported on, so lookup relationships never appear in report types"
  ],a:0,e:"Lookups are loosely coupled: the child keeps its own owner/sharing and can exist independently of the parent."},
  {c:"MODEL",d:"Intermediate",q:"What is the maximum number of master-detail relationships a single custom object can have?",o:[
    "One, so an object can be the detail side of only a single relationship",
    "Five, matching the platform limit on total relationship fields per object",
    "Two, which is what makes a junction object for many-to-many relationships possible",
    "Unlimited, letting an object be the detail side of as many parents as needed"
  ],a:2,e:"An object can be the detail side of at most two master-detail relationships (which is what makes junction objects possible)."},
  {c:"MODEL",d:"Intermediate",q:"Record types are primarily used to:",o:[
    "Encrypt the data stored in a record so only certain profiles can decrypt it",
    "Offer different picklist values, page layouts, and business processes to different user groups",
    "Deploy code and configuration from a sandbox into the production environment on a set schedule",
    "Detect and merge duplicate records that share matching names or email values"
  ],a:1,e:"Record types tailor picklist values, page layouts, and business processes so different user groups see a fitted experience for the same object."},
  {c:"MODEL",d:"Intermediate",q:"A formula field is:",o:[
    "Stored physically on the record and edited directly by users like a text field",
    "A kind of validation rule that blocks the save when its condition is not met",
    "Read-only and calculated at runtime from other fields, so users never type into it",
    "A field type that is available only on the standard User object in an org"
  ],a:2,e:"Formula fields are read-only, derived values computed on the fly from other fields; users don't enter data into them."},
  {c:"MODEL",d:"Advanced",q:"In a dependent picklist, the 'controlling' field:",o:[
    "Must always be a plain text field whose entry drives the dependent picklist",
    "Can be a picklist or a checkbox, and filters which values the dependent field offers",
    "Is the same thing as a roll-up summary field defined on the parent object",
    "Must be an encrypted field so the dependent values remain hidden until chosen"
  ],a:1,e:"A controlling field (picklist or checkbox) determines which values are available in the dependent picklist."},
  {c:"MODEL",d:"Foundational",q:"The API name of a custom field or object ends with which suffix?",o:[
    "__x, the suffix Salesforce appends to the API name of custom objects and fields",
    "__c, the suffix Salesforce appends to the API name of custom objects and fields",
    "__r, the suffix Salesforce appends to the API name of custom objects and fields",
    "__e, the suffix Salesforce appends to the API name of custom objects and fields"
  ],a:1,e:"Custom objects and fields carry the __c suffix. __r denotes a relationship, __x an external object, __e a platform event."},
  {c:"MODEL",d:"Advanced",q:"A hierarchical relationship is a special lookup available specifically on which object?",o:[
    "Account, where it links parent and child companies in a corporate hierarchy",
    "Opportunity, where it connects a deal to a related renewal or upsell deal",
    "User, where the hierarchical relationship type relates a user to another user",
    "Case, where it ties a case to a parent case for grouping related issues"
  ],a:2,e:"The hierarchical relationship type exists only on the User object (e.g., the standard 'Manager' field) and references other users."},
  {c:"MODEL",d:"Intermediate",q:"Schema Builder is used to:",o:[
    "Write and run SOQL queries against the org's objects and then inspect the returned results",
    "Assign profiles and permission sets to users from a drag-and-drop canvas",
    "Schedule dashboards and reports for recurring delivery to teams of users",
    "Visualize and edit the data model — objects, fields, and relationships — graphically"
  ],a:3,e:"Schema Builder provides a drag-and-drop, visual view of objects and their relationships, and can create objects/fields."},
  {c:"MODEL",d:"Advanced",q:"You want to convert a master-detail relationship to a lookup. What must be true first?",o:[
    "The child object must first be deleted and then recreated as a standalone object",
    "There must be no roll-up summary fields on the master that use that relationship",
    "The object's org-wide default must be set to Public Read/Write before converting",
    "The parent object must have at least one record type defined before the change"
  ],a:1,e:"Because roll-up summaries depend on master-detail, you must remove those roll-ups before converting the relationship to a lookup."},
  {c:"MODEL",d:"Intermediate",q:"An external ID field is best described as:",o:[
    "A field that hides its data from users who lack the View All Data permission",
    "A required system field that Salesforce automatically adds to every standard and custom object",
    "A field type that stores an image or file retrieved from an external system",
    "A custom field flagged as a unique key from an external system, useful for upserts and matching"
  ],a:3,e:"External ID fields mark a value from another system as a matching key, enabling upsert and integration lookups; they can be indexed."},
  {c:"MODEL",d:"Advanced",q:"Which field type stores a system-generated, sequential, read-only identifier?",o:[
    "Text, which stores free-form characters that users can enter and edit at will",
    "Formula, which derives a read-only value at runtime from other fields on the record",
    "Roll-Up Summary, which aggregates values from a set of related child records",
    "Auto-Number, which assigns sequential, formatted, read-only values as records are created"
  ],a:3,e:"Auto-Number fields assign sequential, formatted, read-only values (e.g., INV-{0001}) as records are created."},
  {c:"MODEL",d:"Advanced",q:"External objects (with the __x suffix) accessed through Salesforce Connect:",o:[
    "Store all of their data physically inside Salesforce, just like ordinary custom objects do",
    "Are simply another name for custom objects and behave identically to them",
    "Map to data that lives in an external system and is retrieved on demand, not stored locally",
    "Hold external data but cannot be added to page layouts or shown to users"
  ],a:2,e:"External objects represent data stored outside Salesforce (e.g., via OData); Salesforce retrieves it in real time rather than storing it."},
  {c:"DMGMT",d:"Intermediate",q:"The Data Import Wizard is generally appropriate when you need to:",o:[
    "Importing tens of millions of records across every standard and custom object in a single scheduled job",
    "Deleting all of the records in an object at once and emptying the Recycle Bin",
    "Deploying metadata such as objects and fields from a sandbox into production",
    "Importing up to 50,000 records into common standard or custom objects, with duplicate prevention"
  ],a:3,e:"The Data Import Wizard handles up to 50,000 records for accounts, contacts, leads, campaign members, solutions, and custom objects, and can help avoid duplicates."},
  {c:"DMGMT",d:"Intermediate",q:"Compared to the Data Import Wizard, Data Loader is preferred because it:",o:[
    "It supports far larger volumes, all objects, and operations like upsert, delete, and export",
    "It needs no CSV file, reading the records directly from an external database",
    "It cannot be scheduled or automated, forcing every load to be run by hand",
    "It works only with the Contact object, but it processes those records very quickly in bulk"
  ],a:0,e:"Data Loader handles up to ~5 million records, supports virtually all objects, and performs insert/update/upsert/delete/hard delete/export."},
  {c:"DMGMT",d:"Advanced",q:"An 'upsert' operation:",o:[
    "Inserts only brand-new records and skips any that already exist in the org",
    "Deletes the matched records and replaces them with rows from the source file",
    "Updates a record when a match is found by Id or external ID, otherwise inserts a new one",
    "Exports the matched records out to a CSV file without changing anything at all in the org"
  ],a:2,e:"Upsert combines update and insert: matches on Id or an external ID to update, and creates the record when no match exists."},
  {c:"DMGMT",d:"Intermediate",q:"Records deleted from most objects go to the Recycle Bin and are recoverable for how long?",o:[
    "24 hours, after which deleted records are purged from the Recycle Bin overnight",
    "90 days, giving admins a full quarter to restore anything removed by mistake",
    "15 days, after which the deleted records are removed permanently from the org",
    "Indefinitely, so deleted records remain recoverable until an admin empties the bin"
  ],a:2,e:"Deleted records remain in the Recycle Bin for 15 days by default, after which they are permanently removed."},
  {c:"DMGMT",d:"Advanced",q:"A 'hard delete' via Data Loader differs from a normal delete because it:",o:[
    "Sends the records to the Recycle Bin where they stay recoverable for fifteen days",
    "Only marks the records inactive while leaving them fully visible in reports",
    "Bypasses the Recycle Bin so the records are removed immediately and cannot be recovered",
    "Runs faster than a normal delete but can still be reversed from the Recycle Bin"
  ],a:2,e:"Hard delete permanently removes records without placing them in the Recycle Bin — they cannot be restored."},
  {c:"DMGMT",d:"Intermediate",q:"Salesforce's duplicate management uses which two components together?",o:[
    "Matching rules define how records are compared; duplicate rules decide what then happens",
    "Validation rules check the data and workflow rules act when a duplicate is found",
    "Sharing rules and org-wide defaults together decide which duplicates a user sees",
    "Report types and dashboards surface duplicates so an admin can merge them by hand"
  ],a:0,e:"Matching rules define how records are compared; duplicate rules decide what happens (block or alert) when a match is found."},
  {c:"DMGMT",d:"Intermediate",q:"The scheduled Data Export service is primarily used for:",o:[
    "Migrates metadata such as objects and code between a sandbox and production",
    "Creates periodic backup exports of your org's data on a weekly or monthly schedule",
    "Assigns permission sets to users in bulk based on a scheduled CSV file",
    "Encrypts fields across the org so exported data is unreadable without a key"
  ],a:1,e:"The Data Export service generates scheduled (weekly/monthly, edition-dependent) backup files of org data."},
  {c:"DMGMT",d:"Advanced",q:"When loading large volumes with Data Loader, enabling the Bulk API helps because it:",o:[
    "It processes records asynchronously in parallel batches, improving throughput for large data sets",
    "It guarantees that no validation, required-field, or duplicate errors occur anywhere during the load",
    "It removes the need to map any source columns to the target object's fields",
    "It bypasses field-level security so every field loads regardless of access"
  ],a:0,e:"The Bulk API processes large data sets asynchronously in parallel batches, which is more efficient than row-by-row SOAP processing."},
  {c:"DMGMT",d:"Advanced",q:"During an import, the 'field mapping' step:",o:[
    "Sets the sharing rules that will apply to the newly imported records",
    "Deploys the code and configuration needed to support the imported data",
    "Creates a custom report type covering the object being imported into",
    "Matches columns in your source file to the fields on the target object"
  ],a:3,e:"Field mapping tells Salesforce which source column populates which target field; unmapped required fields cause errors."},
  {c:"DMGMT",d:"Intermediate",q:"Mass Transfer Records is typically used to:",o:[
    "Delete large numbers of records in a single pass across supported objects",
    "Reassign ownership of many records from one user or queue to another in bulk",
    "Convert many leads at once into accounts, contacts, and opportunities",
    "Export records in bulk to a CSV file for archival and backup purposes"
  ],a:1,e:"Mass Transfer reassigns record ownership in bulk (e.g., when an employee leaves), for supported objects."},
  {c:"DMGMT",d:"Advanced",q:"A CSV import repeatedly fails on a date column. The MOST common cause is:",o:[
    "The target object does not yet have a page layout assigned to the profile",
    "The user running the import has not been assigned a role in the hierarchy",
    "Field history tracking is switched on for the date field being imported",
    "Date values that do not match the expected format or locale for the org"
  ],a:3,e:"Date/number formatting and locale mismatches are a frequent source of import errors; values must match the expected format."},
  {c:"DMGMT",d:"Intermediate",q:"Which statement about data quality is true?",o:[
    "Data quality can be enforced only by writing Apex triggers on each object",
    "Org-wide default settings prevent bad data from ever being entered by users",
    "Reports automatically detect and clean up bad data every single time that they are refreshed",
    "Required fields, validation rules, and duplicate rules together enforce integrity at entry"
  ],a:3,e:"Data integrity is enforced through a combination of required fields, validation rules, picklists, and duplicate management at the point of entry."},
  {c:"AUTO",d:"Intermediate",q:"Which tool is Salesforce's current, strategic automation platform (with Workflow Rules and Process Builder being retired/migrated)?",o:[
    "Approval Processes, now the primary way Salesforce recommends automating all logic",
    "Apex triggers, which Salesforce positions as the standard for declarative automation",
    "Outbound Messages, the modern replacement for both Workflow Rules and Process Builder",
    "Flow, the go-forward declarative tool as Workflow Rules and Process Builder are retired"
  ],a:3,e:"Flow is the go-forward declarative automation tool; Salesforce is retiring Workflow Rules and Process Builder and encourages migration to Flow."},
  {c:"AUTO",d:"Intermediate",q:"A Screen Flow is distinguished by the fact that it:",o:[
    "It runs only on a schedule with no user present to enter any data",
    "It can be launched only from a record trigger when a record changes",
    "It collects input and guides a user through interactive screens in the UI",
    "It is unable to create records and can only read and display existing data"
  ],a:2,e:"Screen Flows present interactive screens for user input/guidance; they run when launched by a user or embedded on a page/action."},
  {c:"AUTO",d:"Advanced",q:"For updating fields on the SAME record that triggered the automation, the most efficient flow choice is:",o:[
    "A before-save record-triggered flow, which updates the record in memory with no extra DML",
    "An after-save record-triggered flow, which re-queries and updates the record again",
    "A scheduled flow, which picks the record up later and writes the change back",
    "A screen flow, which prompts the user to confirm each field before it saves"
  ],a:0,e:"Before-save record-triggered flows update the triggering record in memory before it's saved — no extra DML — making them the efficient choice for same-record updates."},
  {c:"AUTO",d:"Advanced",q:"In the order of execution, before-save record-triggered flows run:",o:[
    "After validation rules, once the record has passed every configured check",
    "After workflow rules run, re-triggering the record once all of those actions complete",
    "Only after the record is committed and the transaction has fully finished",
    "Before validation rules, alongside before triggers, early in the order of execution"
  ],a:3,e:"Per Salesforce's order of execution, before-save flows (and before triggers) execute before custom validation rules evaluate."},
  {c:"AUTO",d:"Intermediate",q:"An approval process is used to:",o:[
    "Detect and merge duplicate account records that share the same company name",
    "Encrypt the fields on a record so only approvers can read their values",
    "Schedule reports and dashboards to be delivered to approvers on a set cadence",
    "Route a record through one or more approval steps with defined approvers and actions"
  ],a:3,e:"Approval processes define submission criteria, approval steps/approvers, and actions on approval, rejection, or recall."},
  {c:"AUTO",d:"Intermediate",q:"Which is a valid trigger type for a record-triggered flow?",o:[
    "When a report is run, so the flow can act on each row in the results",
    "When a record is created, updated, or deleted, and optionally on undelete",
    "When a dashboard is refreshed, so the flow can react to the new totals",
    "When a user logs in, so the flow can validate their session and location"
  ],a:1,e:"Record-triggered flows fire on record create, update, delete (and can also handle the record being saved conditions)."},
  {c:"AUTO",d:"Advanced",q:"A 'scheduled path' in a record-triggered flow lets you:",o:[
    "Run the entire flow immediately and only in the same synchronous transaction",
    "Execute part of the flow at a set time after the trigger, such as three days later",
    "Bypass the flow's entry criteria so it runs on every record without filtering",
    "Convert a lead into an account, contact, and opportunity as the record saves"
  ],a:1,e:"Scheduled paths run flow logic asynchronously at a defined time relative to the trigger, replacing time-based workflow actions."},
  {c:"AUTO",d:"Intermediate",q:"Which flow element retrieves existing records from the database?",o:[
    "Get Records, which queries the database and stores the results in variables",
    "Assignment, which sets values into variables already loaded in the flow",
    "Decision, which branches the flow based on conditions you configure",
    "Screen, which displays fields to the user and collects their input"
  ],a:0,e:"The Get Records element queries the database and stores results in variables for use later in the flow."},
  {c:"AUTO",d:"Advanced",q:"A 'fault path' (fault connector) in a flow is used to:",o:[
    "Speed up loops by processing each item in a collection in parallel",
    "Handle errors gracefully when an element fails, such as a DML operation",
    "Skip validation rules so the flow's record changes always save cleanly",
    "Schedule the flow to run at a later time relative to the trigger"
  ],a:1,e:"Fault paths route execution when an element errors, letting you display a message, log the error, or take corrective action."},
  {c:"AUTO",d:"Intermediate",q:"Which flow element is required to iterate over each item in a collection?",o:[
    "Decision, which evaluates conditions and routes the flow down a branch",
    "Assignment, which copies values into and between the flow's variables",
    "Loop, which iterates over a collection variable one item at a time",
    "Subflow, which calls another autolaunched flow and waits for it to finish"
  ],a:2,e:"The Loop element iterates over a collection variable, processing one item per iteration."},
  {c:"AUTO",d:"Advanced",q:"To reuse the same flow logic inside multiple flows, you would build it as an autolaunched flow and call it via a:",o:[
    "A Subflow element that invokes another autolaunched flow for modular reuse",
    "A validation rule that the flow calls whenever it needs the shared logic",
    "A workflow rule referenced from each flow that needs the same behavior",
    "A report that each flow runs to obtain the shared calculation results"
  ],a:0,e:"A Subflow element invokes another (autolaunched) flow, promoting reuse and modular design."},
  {c:"AUTO",d:"Intermediate",q:"Which legacy automation tool sends a structured message to an external endpoint as part of workflow?",o:[
    "Email alert, a workflow action that sends a templated email to chosen recipients",
    "Outbound message, a workflow action that sends a SOAP message to an endpoint",
    "Field update, a workflow action that changes a field value on the record",
    "Task creation, a workflow action that assigns a follow-up task to a user"
  ],a:1,e:"Outbound messages (a workflow action) send a SOAP message to a designated external endpoint. In Flow, callouts are handled differently."},
  {c:"AUTO",d:"Advanced",q:"A record-triggered flow that performs SOQL/DML inside a loop for each record risks:",o:[
    "Better performance, since each record is handled in its own tidy iteration",
    "Automatically bulkifying itself, so the platform consolidates the operations",
    "Hitting governor limits, because the operations are multiplied and not bulkified",
    "Nothing at all, because querying inside a loop is the recommended practice"
  ],a:2,e:"Placing Get/Create/Update elements inside loops can multiply queries/DML and hit limits; operate on collections outside the loop instead."},
  {c:"AUTO",d:"Intermediate",q:"A custom notification action in Flow allows you to:",o:[
    "Delete a set of records that match the criteria defined in the flow",
    "Send an in-app, desktop, or mobile notification to specified recipients",
    "Change the org-wide default sharing level for an object at runtime",
    "Spin up a new sandbox and copy the current configuration into it"
  ],a:1,e:"The Send Custom Notification action pushes bell/desktop/mobile notifications to users based on a notification type."},
  {c:"AUTO",d:"Advanced",q:"Assignment rules (for leads or cases) are used to:",o:[
    "Assign profiles and permission sets to the right users according to defined conditions",
    "Automatically route new or edited records to the right user or queue based on criteria",
    "Set field-level security on a record's fields based on its field values",
    "Schedule flows to run against the record at a chosen time after creation"
  ],a:1,e:"Assignment rules evaluate criteria to auto-assign leads or cases to owners or queues in the correct order."},
  {c:"AUTO",d:"Intermediate",q:"An after-save record-triggered flow is the right choice when you need to:",o:[
    "Only update fields on the triggering record with no other related actions",
    "Avoid performing any DML at all while still changing the triggering record",
    "Prevent the record from being saved when it fails a configured condition",
    "Create or update related records, send emails, or call other actions after save"
  ],a:3,e:"After-save flows run once the record is saved, which is required to reference the record's Id and to act on related records or fire actions."},
  {c:"AUTO",d:"Advanced",q:"Which statement about validation rules is correct?",o:[
    "Run only inside Apex code and cannot be built by admins declaratively",
    "Automatically correct bad data by overwriting the invalid field values",
    "Evaluate a formula and block the save with an error when it returns true",
    "Exist only on standard objects and cannot be added to custom objects"
  ],a:2,e:"A validation rule fires when its formula evaluates to TRUE, preventing the save and showing the configured error."},
  {c:"AUTO",d:"Intermediate",q:"Which of the following can a Screen Flow do that a record-triggered flow cannot?",o:[
    "Present interactive input screens to a user during the flow",
    "Query records from the database using a Get Records element",
    "Update records in the database through a create or update element",
    "Branch using decision logic based on the data in the flow"
  ],a:0,e:"Only Screen Flows include Screen elements for interactive user input; record-triggered flows run without a UI."},
  {c:"SALES",d:"Intermediate",q:"When a lead is converted, Salesforce creates (at minimum) which records?",o:[
    "A case and a solution used to track and resolve the new customer's first support request",
    "A campaign and a product record to begin marketing to the new customer",
    "An account and a contact, and optionally an opportunity, reusing matches where possible",
    "A queue and a role so the converted lead can be routed and shared"
  ],a:2,e:"Lead conversion produces an Account and Contact, and optionally an Opportunity; existing matches can be reused."},
  {c:"SALES",d:"Foundational",q:"Web-to-Lead is used to:",o:[
    "Convert existing opportunities back into the accounts that they came from",
    "Encrypt lead data submitted through the company's public website forms",
    "Send mass marketing email to a list of leads captured from the website",
    "Capture information from a website form and create Lead records in Salesforce"
  ],a:3,e:"Web-to-Lead generates HTML forms that create Lead records in Salesforce from website submissions."},
  {c:"SALES",d:"Intermediate",q:"To add a product to an opportunity, the product must first have:",o:[
    "A price book entry, giving the product a price in an active price book",
    "A validation rule that permits the product to be added to the deal",
    "A record type on the product that matches the opportunity's record type",
    "An approval process that clears the product before it joins the deal"
  ],a:0,e:"Products need a price book entry (list price in a price book) before they can be added as opportunity line items."},
  {c:"SALES",d:"Intermediate",q:"The Standard Price Book:",o:[
    "Is optional and rarely used, since each product carries its own list price directly",
    "Stores the entitlements that define the support each customer is owed",
    "Holds the master list price for products and is required before custom price books",
    "Is simply another kind of report that lists products and their prices"
  ],a:2,e:"The Standard Price Book holds each product's standard list price; products need a standard price before appearing in custom price books."},
  {c:"SALES",d:"Intermediate",q:"Opportunity Stage is tied to which configurable element that controls the stage picklist and probability for different teams?",o:[
    "A support process, assigned through case record types, that lists the available case statuses",
    "An escalation rule that advances the stage when time-based criteria are met",
    "A sales process, defined via record types, that sets the stages and probabilities per team",
    "An assignment rule that routes the opportunity as its stage changes over time"
  ],a:2,e:"A sales process defines the ordered stages available; record types map different sales processes to different users."},
  {c:"SALES",d:"Advanced",q:"Collaborative Forecasts primarily help sales teams:",o:[
    "Route incoming cases to the agents best suited to resolve each one",
    "Find and merge duplicate leads before they are converted into deals",
    "Project future sales from opportunity amounts, stages, and forecast categories",
    "Encrypt opportunity records so only the sales team can read their amounts"
  ],a:2,e:"Collaborative Forecasts roll up opportunity data by forecast category and hierarchy to project expected revenue."},
  {c:"SALES",d:"Intermediate",q:"A Campaign in Salesforce is used to:",o:[
    "Store the list prices for products that the sales team quotes to buyers",
    "Track a marketing initiative, its members, and the pipeline it influences",
    "Assign permission sets to the users working a given marketing program",
    "Escalate unresolved cases to managers when a service level is breached"
  ],a:1,e:"Campaigns track marketing efforts, their members, costs, and influence on pipeline and revenue."},
  {c:"SALES",d:"Intermediate",q:"'Path' on an opportunity or lead provides:",o:[
    "Encrypt the whole record so that only the users on the deal can read its field values",
    "List the duplicate records that match the current opportunity or lead",
    "Display a log of the deployments that have touched the record's object",
    "Provide visual stage guidance with key fields and tips for success at each step"
  ],a:3,e:"Path shows a horizontal progress bar for a picklist (e.g., Stage) with per-step guidance and highlighted fields."},
  {c:"SALES",d:"Advanced",q:"Opportunity Teams and Account Teams are used to:",o:[
    "Grant a group of collaborators specific roles and access levels on a record",
    "Replace the role hierarchy with a flat team structure for record sharing",
    "Set the org-wide default sharing level for opportunities and accounts",
    "Create the products and price book entries the team will sell together"
  ],a:0,e:"Teams let you add users with defined roles and access levels to individual opportunities/accounts for collaboration."},
  {c:"SALES",d:"Intermediate",q:"Contact Roles on an opportunity capture:",o:[
    "Define the org's sharing model for the opportunity and its related records",
    "Capture which contacts are involved and the role each one plays in the deal",
    "Determine the profile assigned to each contact associated with the deal",
    "Select the price book that governs the products added to the opportunity"
  ],a:1,e:"Opportunity Contact Roles associate contacts with a deal and label their role (e.g., Decision Maker, Influencer)."},
  {c:"SALES",d:"Advanced",q:"When a Quote is synced to an Opportunity:",o:[
    "Deletes the opportunity once the quote is accepted by the customer",
    "Creates a support case so the delivery team can fulfill the order",
    "Merges the account named on the quote together with the account on the opportunity record",
    "Keeps the quote's line items and the opportunity's products in sync with each other"
  ],a:3,e:"Syncing keeps the quote's line items and the opportunity's products aligned, so changes flow between them."},
  {c:"SALES",d:"Foundational",q:"A Lead typically represents:",o:[
    "A closed customer account with an established, ongoing purchasing history",
    "A support ticket capturing a customer's question, issue, or request",
    "A prospect or unqualified potential customer that has not yet been converted",
    "A product's list price as stored within an active price book entry"
  ],a:2,e:"Leads are unqualified prospects. Once qualified, they're converted into accounts, contacts, and opportunities."},
  {c:"SALES",d:"Intermediate",q:"Lead assignment rules determine:",o:[
    "Which page layout a lead displays depending on its record type",
    "The org-wide default sharing level applied to newly created leads",
    "Which reports and dashboards are able to include the lead records",
    "Which user or queue a new or edited lead is routed to based on criteria"
  ],a:3,e:"Lead assignment rules route incoming leads to the appropriate owner or queue based on defined criteria and order."},
  {c:"SERVICE",d:"Foundational",q:"A Case in Salesforce represents:",o:[
    "A marketing campaign and the leads and contacts that belong to it",
    "A product's list price as stored in an active company price book",
    "A permission set that grants a support agent access to console tools",
    "A customer question, issue, or request to be tracked and resolved"
  ],a:3,e:"Cases track customer issues/requests through their lifecycle to resolution."},
  {c:"SERVICE",d:"Intermediate",q:"Email-to-Case allows an org to:",o:[
    "Send bulk marketing email out to a large segmented list of customers and prospects each day",
    "Encrypt the contents of cases so only assigned agents can read them",
    "Automatically create cases from inbound customer emails and thread the correspondence",
    "Merge duplicate account records that arrive through the support inbox"
  ],a:2,e:"Email-to-Case turns inbound emails to a support address into cases and keeps email threads attached to the case."},
  {c:"SERVICE",d:"Intermediate",q:"Case escalation rules are used to:",o:[
    "Route brand-new cases to the right owner at the moment they are first created",
    "Convert resolved cases into leads so sales can follow up for more business",
    "Escalate cases when time-based criteria are met, such as reassigning or notifying on an SLA breach",
    "Delete resolved cases automatically once they have been in a closed status for a set number of days"
  ],a:2,e:"Escalation rules act on cases that meet age/criteria conditions — reassigning and notifying to enforce service levels."},
  {c:"SERVICE",d:"Advanced",q:"Entitlements and milestones in Service Cloud are used to:",o:[
    "Track and enforce service-level agreements and the required, timed steps within them",
    "Manage marketing campaigns and measure the sales pipeline that each one of them influences",
    "Set the org-wide default sharing level for cases and their related records",
    "Build dashboards that summarize case volume and agent performance over time"
  ],a:0,e:"Entitlements define the support a customer is due; milestones represent required, time-bound steps (e.g., first response) within them."},
  {c:"SERVICE",d:"Intermediate",q:"Salesforce Knowledge is used to:",o:[
    "Store and surface articles like FAQs and how-tos, organized with data categories",
    "Route inbound phone calls to available agents using skills-based logic",
    "Encrypt the fields on case records so only certain profiles can read them",
    "Deploy metadata such as articles and layouts from a sandbox to production"
  ],a:0,e:"Knowledge manages a library of articles, classified by data categories, to help agents and customers self-serve."},
  {c:"SERVICE",d:"Advanced",q:"Omni-Channel is designed to:",o:[
    "Encrypt all customer data at rest across the service console and channels",
    "Replace the role hierarchy with a routing model based on agent skills",
    "Build and schedule the reports that measure a support team's performance",
    "Push work items to the most available, qualified agents in real time"
  ],a:3,e:"Omni-Channel routes work to agents based on capacity, availability, and skills, and surfaces it in the console."},
  {c:"SERVICE",d:"Intermediate",q:"Queues in Service Cloud are commonly used to:",o:[
    "Store product list prices used when quoting service contracts to customers",
    "Define the org-wide default sharing level applied to newly created cases",
    "Encrypt case data so only the assigned agent can read the details",
    "Hold cases so team members can take ownership from a shared pool"
  ],a:3,e:"Case queues let teams share a backlog; members accept/own cases from the queue as they work them."},
  {c:"SERVICE",d:"Intermediate",q:"Auto-response rules for cases:",o:[
    "Detect and delete duplicate cases that arrive from the same customer at once",
    "Send an automatic email acknowledgment to the contact based on matching criteria",
    "Assign profiles and permission sets to agents based on the cases they own",
    "Escalate cases straight to managers whenever any new case is first created"
  ],a:1,e:"Auto-response rules send templated acknowledgment emails to customers when a new case matches specified criteria."},
  {c:"SERVICE",d:"Advanced",q:"A support process (assigned via case record types) controls:",o:[
    "The field-level security applied to the fields shown on the case",
    "The org-wide default sharing level that governs case visibility",
    "The set of Status picklist values available for that type of case",
    "The role each agent holds within the support team's hierarchy"
  ],a:2,e:"Support processes define which case Status values are available; record types map processes to user groups, similar to sales processes for opportunities."},
  {c:"SERVICE",d:"Intermediate",q:"Macros in the Service Console let agents:",o:[
    "Run Apex batch jobs against large volumes of case records asynchronously",
    "Execute a set of repetitive actions, like updating fields and sending an email, in one click",
    "Deploy change sets that contain console configuration from a sandbox into the production org itself",
    "Define the sharing rules that control which cases each agent is able to see"
  ],a:1,e:"Macros automate repetitive multi-step tasks on records (like completing fields and sending a standard email) to speed agent work."},
  {c:"SERVICE",d:"Advanced",q:"Open CTI (Computer Telephony Integration) is used to:",o:[
    "Encrypt call recordings and transcripts so that only supervisors are able to review them later",
    "Import large volumes of contact and case data from an external phone system",
    "Integrate telephony into the console with call controls and screen pops, without desktop plugins",
    "Build the dashboards that report on call volume and average handle time"
  ],a:2,e:"Open CTI is a browser-based framework letting partners embed call controls and screen pops into the Salesforce console."},
  {c:"SERVICE",d:"Intermediate",q:"Web-to-Case enables:",o:[
    "Send SMS text messages to customers who submit a web form",
    "Merge duplicate contacts who reach out through the website",
    "Create cases from a form on your website, similar to Web-to-Lead",
    "Encrypt cases that are generated from public website forms"
  ],a:2,e:"Web-to-Case captures customer submissions from a web form and generates cases in Salesforce, similar to Web-to-Lead."},
  {c:"ANALYTICS",d:"Intermediate",q:"A report type determines:",o:[
    "The specific colors and styling applied to the charts that are built from the report",
    "Which user owns the report and the folder in which it is stored",
    "Which objects and fields a report can use, and how related objects are joined",
    "The schedule on which the report refreshes and is emailed to users"
  ],a:2,e:"Report types define the objects, their relationships, and the fields available when building a report."},
  {c:"ANALYTICS",d:"Intermediate",q:"Which report format groups records by BOTH rows and columns?",o:[
    "Tabular, which lists rows of records much like a simple spreadsheet",
    "Matrix, which summarizes data across a grid of row and column groupings",
    "Summary, which groups records into rows with subtotals under each group",
    "Joined, which places multiple report blocks side by side for comparison"
  ],a:1,e:"Matrix reports summarize data across a grid of row groupings and column groupings — useful for comparisons."},
  {c:"ANALYTICS",d:"Advanced",q:"A tabular report can be used as a dashboard component source only when:",o:[
    "A row limit is set on the report, since tabular reports have no groupings",
    "The report contains at least three columns of fields to display",
    "The report is marked private and stored in the running user's folder",
    "The report includes at least one custom formula field in its columns"
  ],a:0,e:"Tabular reports lack groupings, so they need a row limit set to feed most dashboard components (e.g., a table or chart)."},
  {c:"ANALYTICS",d:"Intermediate",q:"The 'running user' of a dashboard determines:",o:[
    "Which users are allowed to edit the dashboard and its components",
    "The color palette and visual theme applied across all of the dashboard's charts",
    "Whose data-access level is used to display the dashboard's data to viewers",
    "How often the dashboard refreshes and is delivered to subscribers"
  ],a:2,e:"By default, all viewers see dashboard data through the running user's security context, regardless of their own access."},
  {c:"ANALYTICS",d:"Advanced",q:"A dynamic dashboard is one that:",o:[
    "Refreshes entirely on its own every minute without any kind of user action required",
    "Cannot contain charts and is limited to tables and summary metrics",
    "Is stored in the Recycle Bin and restored each time it is viewed",
    "Displays data according to each viewer's own access, as the logged-in user"
  ],a:3,e:"Dynamic dashboards render data based on the viewing user's permissions, so each person sees only their data. (They cannot be scheduled/subscribed.)"},
  {c:"ANALYTICS",d:"Intermediate",q:"A bucket field lets you:",o:[
    "Categorize report records into groups on the fly without a new formula field",
    "Encrypt a column in the report so its values are hidden from viewers",
    "Schedule the report so it is delivered to a list of users each morning",
    "Join two objects together so their fields appear in the same report"
  ],a:0,e:"Bucket fields group values into custom categories directly in the report, without a new custom field or formula."},
  {c:"ANALYTICS",d:"Advanced",q:"A cross filter on a report is used to:",o:[
    "Filter records by the presence or absence of related child records, using WITH or WITHOUT",
    "Change the report format between tabular, summary, matrix, and joined layouts",
    "Hide selected columns from the report display while keeping them in the underlying data set",
    "Set the running user whose access governs the records the report returns"
  ],a:0,e:"Cross filters include or exclude parent records based on whether related child records exist (e.g., Accounts WITHOUT Opportunities)."},
  {c:"ANALYTICS",d:"Intermediate",q:"Report folders primarily control:",o:[
    "The chart type used by each report that is stored inside the folder",
    "The groupings and subtotals applied to the reports within the folder",
    "The running user whose access level governs the dashboards that are fed by the reports",
    "Who can access and manage a set of reports, through folder sharing and visibility"
  ],a:3,e:"Folders organize reports/dashboards and govern who can view or manage them via folder sharing."},
  {c:"ANALYTICS",d:"Advanced",q:"A joined report allows you to:",o:[
    "Merge two account records that share the same company name and address",
    "Combine multiple report blocks, possibly from different report types, side by side",
    "Encrypt the data within the report so only certain profiles can read it",
    "Schedule a dashboard so its components refresh and are emailed on a cadence"
  ],a:1,e:"Joined reports contain multiple blocks — even across different report types — for side-by-side comparison of related data."},
  {c:"ANALYTICS",d:"Intermediate",q:"To have a report or dashboard delivered on a schedule, a user can:",o:[
    "Convert it into a lead so sales can follow up on the results",
    "Subscribe to it, or schedule it, for recurring automated delivery",
    "Move it into the Recycle Bin so it refreshes on the next view",
    "Add it to a permission set that is assigned to the recipients"
  ],a:1,e:"Users can subscribe to reports/dashboards to receive them on a recurring schedule (with conditions on report subscriptions)."},
  {c:"ANALYTICS",d:"Advanced",q:"A custom summary formula in a report operates on:",o:[
    "Individual raw rows only, calculating a value for each record",
    "Grouped and summary values, such as subtotals, within the report",
    "Fields that do not exist yet, creating them as the report runs",
    "The running user, adjusting totals to that person's access level"
  ],a:1,e:"Custom summary formulas compute across grouped data (subtotals/grand totals). Row-level formulas, by contrast, calculate per record."},
  {c:"ANALYTICS",d:"Intermediate",q:"Every dashboard component must be based on:",o:[
    "Another existing dashboard, whose components it mirrors and then reformats for display",
    "A permission set that defines which users can view the component",
    "A validation rule that determines when the component shows data",
    "A source report, or another supported data source, that supplies its data"
  ],a:3,e:"Each standard dashboard component draws from a source report that supplies its data."},
  {c:"ANALYTICS",d:"Advanced",q:"Historical trend reporting lets you:",o:[
    "Encrypt historical records so their prior values cannot be read by users",
    "Delete records that have grown too old to keep in active reporting",
    "Assign roles to users based on how their owned records changed over time",
    "Report on how records' field values changed over time using captured snapshots"
  ],a:3,e:"Historical trend reporting compares current values to captured snapshots (e.g., how opportunity amounts shifted day to day)."},
  {c:"ANALYTICS",d:"Intermediate",q:"Filter logic (e.g., '1 AND (2 OR 3)') in a report is used to:",o:[
    "Change the running user whose access governs the report's records",
    "Set field-level security on the fields included in the report",
    "Create a bucket that groups the report's values into categories",
    "Combine multiple report filters with custom AND and OR conditions"
  ],a:3,e:"Filter logic lets you control how individual report filters combine, beyond the default all-AND behavior."},
  {c:"ANALYTICS",d:"Advanced",q:"A standard report type vs a CUSTOM report type: a custom report type primarily lets you:",o:[
    "Choose the chart colors and styling applied to reports of that type",
    "Encrypt the reports built on that report type so that only certain profiles are able to read them in the org",
    "Define the object relationships, including with-or-without related records, and expose specific fields",
    "Set the org-wide default sharing level for the objects in the report"
  ],a:2,e:"Custom report types let admins define which related objects are included (A with B, or A with or without B) and which fields are reportable."},
  {c:"PROD",d:"Foundational",q:"Chatter is best described as:",o:[
    "A data loader for importing and exporting large volumes of records",
    "A deployment tool for moving metadata between sandbox and production",
    "A reporting engine for building charts and dashboards from records",
    "A collaboration tool with feeds, groups, following, and @mentions"
  ],a:3,e:"Chatter is Salesforce's enterprise collaboration layer: feeds on records, groups, following, @mentions, and posts."},
  {c:"PROD",d:"Intermediate",q:"In Salesforce, 'Activities' encompass which two record types?",o:[
    "Cases and Solutions, used to log and resolve customer issues",
    "Leads and Opportunities, used to track prospects and deals",
    "Reports and Dashboards, used to analyze and visualize data",
    "Tasks and Events, tracked against records on the activity timeline"
  ],a:3,e:"Activities are Tasks (to-dos) and Events (calendar entries), tracked against records via the activity timeline."},
  {c:"PROD",d:"Intermediate",q:"Using 'Log a Call' on a record creates:",o:[
    "A new Opportunity capturing the deal discussed on the call",
    "A dashboard summarizing the calls logged against the record",
    "A completed Task recording that the interaction took place",
    "A permission set granting access to the record that was called"
  ],a:2,e:"Log a Call records a past interaction as a completed Task, capturing notes about the call/meeting."},
  {c:"PROD",d:"Intermediate",q:"@mentioning a user in a Chatter post:",o:[
    "Removes that user's access to the record being discussed",
    "Notifies that user and links their name within the feed post",
    "Deactivates that user until they respond to the mention",
    "Changes that user's profile to match the post's author"
  ],a:1,e:"@mentions notify the referenced user and create a link to their profile in the post."},
  {c:"PROD",d:"Advanced",q:"Which email template type lets you embed Apex/merge logic and full custom markup in Classic?",o:[
    "Text template, which sends plain unformatted text with basic merge fields",
    "Visualforce email template, which supports programmatic content and complex merge logic",
    "HTML with letterhead, which applies a branded header to formatted HTML content",
    "Auto-response template, which sends a fixed acknowledgment when criteria are met"
  ],a:1,e:"Visualforce email templates support advanced, programmatic content and complex merge logic beyond basic text/HTML templates."},
  {c:"PROD",d:"Intermediate",q:"Salesforce Files (ContentDocument) differ from the legacy Notes & Attachments in that Files:",o:[
    "Can be shared across records and users, versioned, and centrally managed",
    "Cannot be shared with anyone and stay tied to a single record only",
    "Are visible exclusively to system administrators and never to other users",
    "Cannot be previewed in the browser and must be downloaded to open"
  ],a:0,e:"Files support versioning, sharing across multiple records and people, and richer management than legacy attachments."},
  {c:"PROD",d:"Foundational",q:"A private Chatter group:",o:[
    "Requires an owner or manager to add or approve members, and its posts are not public",
    "Is visible to and joinable by anyone across the org without requiring any approval from a manager",
    "Cannot have members at all and is used only to store files privately",
    "Is simply another name for a queue that owns records for a team"
  ],a:0,e:"Private groups restrict membership and hide posts from non-members; public groups are open to all internal users."},
  {c:"PROD",d:"Intermediate",q:"Topics in Salesforce are used to:",o:[
    "Encrypt the posts within a feed so that only certain named users can read them",
    "Tag and organize records and Chatter posts by subject for easy discovery",
    "Assign licenses to the users who follow a given record or group",
    "Schedule reports about the posts made within a Chatter group"
  ],a:1,e:"Topics categorize records and feed posts by subject, enabling cross-record discovery of related content."},
  {c:"PROD",d:"Intermediate",q:"A List Email in Lightning is typically used to:",o:[
    "Deploy metadata such as email templates from a sandbox into production",
    "Send an individually-addressed email to each recipient in a list or report",
    "Detect and merge duplicate contacts before an email is sent to them",
    "Create a case for each recipient who opens the email that was sent"
  ],a:1,e:"List email sends a single-send email individually to each recipient in a selected list view or report (not for large marketing sends)."},
  {c:"PROD",d:"Foundational",q:"Following a record in Chatter means:",o:[
    "You receive feed updates about changes to the record you follow",
    "You take ownership of the record and become responsible for it",
    "You lock the record so that other users can no longer edit it",
    "You delete the record and move it into the org's Recycle Bin"
  ],a:0,e:"Following surfaces updates about that record in your Chatter feed; it does not change ownership or access."},
  {c:"PROD",d:"Intermediate",q:"Email templates use merge fields to:",o:[
    "Encrypt the email's entire contents so that only the intended recipient can read them",
    "Attach the related files from a record to every email that is sent",
    "Set which user's role and signature appear at the bottom of the email",
    "Insert record-specific data, like a contact's name, automatically into the message"
  ],a:3,e:"Merge fields pull field values from records into the template so each email is personalized automatically."},
  {c:"DEV",d:"Intermediate",q:"Apex is best described as:",o:[
    "A JavaScript framework used to build client-side components in the browser",
    "A tag-based markup language for laying out custom pages in the platform",
    "A reporting tool for building and scheduling analytics across objects",
    "A proprietary, strongly-typed, Java-like language that runs on Salesforce servers"
  ],a:3,e:"Apex is Salesforce's server-side, strongly-typed language with Java-like syntax, executed on the multitenant platform."},
  {c:"DEV",d:"Intermediate",q:"Governor limits exist primarily because Salesforce is:",o:[
    "Salesforce is written in Apex, which imposes strict limits on its own code",
    "Salesforce is multitenant, so shared resources must be protected from any one tenant",
    "Salesforce runs on-premise, where each customer's hardware is tightly bounded",
    "Salesforce is free to use, so limits ration the capacity given to each org"
  ],a:1,e:"In a multitenant architecture, governor limits keep any single tenant's code from monopolizing shared resources."},
  {c:"DEV",d:"Advanced",q:"The synchronous limit on the number of SOQL queries per transaction is:",o:[
    "10, a low cap that forces developers to batch nearly every query",
    "100, the ceiling a synchronous Apex transaction can issue before it errors",
    "50, matching the limit that applies to DML statements in a transaction",
    "Unlimited, provided the queries are written outside of any loop"
  ],a:1,e:"A synchronous Apex transaction may issue up to 100 SOQL queries. Placing queries in loops is the classic way to blow this limit."},
  {c:"DEV",d:"Advanced",q:"The limit on DML statements per Apex transaction is:",o:[
    "150, the maximum number of DML statements allowed per Apex transaction",
    "50, a limit that would force heavy batching of every record change",
    "100, matching the synchronous limit that applies to SOQL queries",
    "500, the ceiling once the Bulk API processes the transaction in batches"
  ],a:0,e:"Apex allows up to 150 DML statements per transaction; bulkify by operating on collections instead of per-record DML."},
  {c:"DEV",d:"Advanced",q:"The maximum number of records a single Apex transaction can retrieve via SOQL is:",o:[
    "10,000, a lower ceiling that applies only to asynchronous transactions",
    "100,000, the combined ceiling reached once multiple queries run in the same context",
    "5,000,000, matching the volume Data Loader can process in a single job",
    "50,000, the total number of records a transaction can retrieve across its queries"
  ],a:3,e:"A transaction can retrieve up to 50,000 records total across SOQL queries."},
  {c:"DEV",d:"Intermediate",q:"'Bulkification' of Apex means:",o:[
    "Running code only at night in scheduled batch jobs so as to spread the workload across off-peak hours",
    "Writing code that handles collections of records efficiently, avoiding SOQL and DML in loops",
    "Deleting large volumes of records in a single operation to save resources",
    "Encrypting every field on an object so its data is protected in bulk"
  ],a:1,e:"Bulkified code processes many records at once (e.g., 200 in a trigger) without per-record queries/DML, respecting governor limits."},
  {c:"DEV",d:"Advanced",q:"In a trigger on delete, which context variable holds the records being deleted?",o:[
    "Trigger.new, which holds the current version of each record being removed",
    "Trigger.newMap, which maps record IDs to the deleted records by their key",
    "Trigger.old, which holds the records being deleted, since Trigger.new is null",
    "Trigger.size, which returns the records being deleted along with their count"
  ],a:2,e:"Trigger.new is null in delete contexts; use Trigger.old (and Trigger.oldMap) to reference the records being deleted."},
  {c:"DEV",d:"Advanced",q:"To deploy Apex to production, the org must have at least what overall unit-test code coverage?",o:[
    "75%, the minimum org-wide Apex coverage required to deploy to production",
    "50%, a threshold high enough to allow most deployments to production",
    "65%, the coverage level Salesforce enforces for each individual class",
    "100%, since every line of Apex must be covered before any deployment"
  ],a:0,e:"Production deployments require at least 75% org-wide Apex code coverage, and every trigger must have some coverage."},
  {c:"DEV",d:"Advanced",q:"Test.startTest() and Test.stopTest() are used in a test method to:",o:[
    "Delete the test data created earlier so the org is left clean afterward",
    "Give the enclosed code a fresh set of governor limits and force async work to finish",
    "Deploy the class under test into production once the assertions all pass",
    "Bypass sharing for the enclosed code so that it can see every single record in the org"
  ],a:1,e:"Code between startTest/stopTest gets a fresh set of governor limits, and asynchronous work (e.g., @future) completes at stopTest."},
  {c:"DEV",d:"Advanced",q:"By default, an Apex test method can see the org's existing data because:",o:[
    "It always can, reading any record that exists in the org during the test",
    "It cannot; tests run isolated with SeeAllData false and should create their own data",
    "It can, but only when the test method is exercising a trigger on an object",
    "It can, but only when the test methods are executed directly in the production org itself"
  ],a:1,e:"Tests are isolated from org data by default; developers should create the records they need within the test."},
  {c:"DEV",d:"Intermediate",q:"Which is true about SOQL versus SOSL?",o:[
    "SOSL performs full-text search across multiple objects; SOQL queries a specific object and its relationships",
    "SOQL performs full-text search across many different objects; SOSL queries only a single specified object and its fields",
    "They are identical in purpose and differ only in the keyword used to begin the statement",
    "Neither can filter its results, so both always return every record they touch"
  ],a:0,e:"SOSL is text search across multiple objects; SOQL retrieves records from a specific object (and related objects) with precise filters."},
  {c:"DEV",d:"Intermediate",q:"Lightning Web Components (LWC) differ from Aura components in that LWC:",o:[
    "Built on modern web standards like Web Components and generally more performant than Aura",
    "Able to run only within Salesforce Classic, unlike Aura components which run in Lightning",
    "Unable to use JavaScript, relying instead on a declarative markup language",
    "Written in Apex and executed on the server rather than in the browser"
  ],a:0,e:"LWC leverages native web standards (custom elements, shadow DOM, modules), typically offering better performance than the older Aura framework."},
  {c:"DEV",d:"Advanced",q:"An Apex class declared 'with sharing':",o:[
    "Ignores the running user's sharing rules and returns every matching record",
    "Grants the Modify All Data permission to the code for the transaction",
    "Enforces the current user's record-level sharing rules while the class runs",
    "Runs the class only within test methods and not in normal execution"
  ],a:2,e:"'with sharing' respects the running user's sharing rules; 'without sharing' ignores them; 'inherited sharing' takes the caller's context."},
  {c:"DEV",d:"Advanced",q:"Which is an asynchronous Apex mechanism suited to processing millions of records in chunks?",o:[
    "A validation rule, which checks each record as the batch job saves it",
    "A screen flow, which walks a user through the records a page at a time",
    "A page layout, which arranges the fields of each processed record",
    "Batch Apex, which processes large data volumes in governor-friendly chunks"
  ],a:3,e:"Batch Apex processes large data volumes in governor-limit-friendly chunks via start/execute/finish methods."},
  {c:"DEV",d:"Advanced",q:"A @future method has which key restriction?",o:[
    "It must be defined inside a trigger and cannot live in a regular class",
    "It accepts only primitive-type parameters, not sObjects, and returns void",
    "It cannot be invoked asynchronously and always blocks the transaction",
    "It is allowed to run in sandboxes only and never in a production org"
  ],a:1,e:"@future methods run async, return void, and accept only primitives (or collections of primitives) — not sObjects — among other limits."},
  {c:"DEV",d:"Advanced",q:"In SOQL, retrieving a field from a related PARENT record uses:",o:[
    "A subquery in parentheses, such as selecting from the child records",
    "A separate SOSL search that joins the parent object to the child",
    "Dot notation across the relationship, such as Contact.Account.Name",
    "A roll-up summary field that copies the parent value onto the child"
  ],a:2,e:"Child-to-parent traversal uses dot notation; parent-to-child uses a nested subquery like (SELECT ... FROM Contacts)."},
  {c:"DEV",d:"Intermediate",q:"Which Apex collection type stores unique, unordered values with no duplicates?",o:[
    "Set, which stores unique values with no duplicates and no guaranteed order",
    "List, which stores an ordered, indexed sequence that allows duplicate values",
    "Map, which stores key-value pairs and looks values up by their unique key",
    "Array, a fixed-size ordered collection accessed by a numeric index position"
  ],a:0,e:"A Set holds unique values without duplicates. Lists are ordered/indexed; Maps store key-value pairs."},
  {c:"DEV",d:"Advanced",q:"Custom Metadata Types are preferred over Custom Settings when you need configuration that:",o:[
    "They can never be deployed and must be recreated by hand in every org",
    "They are visible only to administrators and hidden from all other users",
    "Their records are metadata, so they can be packaged and migrated between orgs",
    "They are built to store millions of rows of high-volume transactional data"
  ],a:2,e:"Custom Metadata Type records are metadata, so they can be deployed/packaged between orgs — unlike custom setting data, which is not deployable as records."},
  {c:"DEV",d:"Intermediate",q:"Visualforce is:",o:[
    "A modern JavaScript-only framework built on native web component standards",
    "A tool for importing and exporting large volumes of records from the org",
    "An older tag-based markup framework with controllers for building custom UI",
    "A type of sandbox used to build and test customizations before release"
  ],a:2,e:"Visualforce is Salesforce's original page-markup framework (with controllers), predating Aura and LWC."},
  {c:"DEV",d:"Advanced",q:"To make an Apex method callable from a Lightning Web Component's @wire or imperative call, the method must be:",o:[
    "Marked private so that only the component's own controller can call it",
    "Written in Visualforce markup rather than in an ordinary Apex class",
    "Placed inside a trigger so it runs whenever the related record changes",
    "Annotated @AuraEnabled, and typically static, with cacheable set for @wire"
  ],a:3,e:"Apex methods exposed to LWC are annotated @AuraEnabled; @wire generally requires (cacheable=true) and a static method."},
  {c:"INT",d:"Intermediate",q:"When choosing between REST and SOAP APIs, REST is generally favored for:",o:[
    "Only bulk data loads, where millions of records move in a single job",
    "Deploying metadata such as objects and code between two Salesforce orgs",
    "Nothing, since SOAP is always required for any Salesforce integration",
    "Lightweight, stateless integrations for mobile and web using JSON over HTTP"
  ],a:3,e:"REST offers a lightweight, resource-based approach (JSON/HTTP), well-suited to web/mobile; SOAP is strongly-typed with a WSDL contract."},
  {c:"INT",d:"Advanced",q:"The Bulk API is specifically optimized for:",o:[
    "Real-time updates to a single record as a user edits it in the UI",
    "Rendering Lightning pages and their components quickly inside the user's web browser",
    "Sending transactional email to customers based on record changes",
    "Asynchronously loading or querying very large data volumes in parallel batches"
  ],a:3,e:"Bulk API handles large data sets asynchronously in batches, ideal for high-volume loads/extracts."},
  {c:"INT",d:"Advanced",q:"Platform Events implement which integration pattern?",o:[
    "Request and reply only, where each individual caller waits for a synchronous response",
    "Synchronous batch processing, moving large data sets in scheduled chunks",
    "Publish and subscribe, an event-driven model that decouples producers from consumers",
    "File transfer, exchanging flat files between Salesforce and other systems"
  ],a:2,e:"Platform Events are a pub/sub messaging mechanism: publishers emit events and any number of subscribers react, decoupling systems."},
  {c:"INT",d:"Advanced",q:"Change Data Capture (CDC) is used to:",o:[
    "Encrypt records at rest so that their field values cannot be read directly in the database",
    "Detect and merge duplicate records that arrive from integrated systems",
    "Publish near-real-time change events for records so external subscribers stay in sync",
    "Schedule reports that summarize how records changed over a time period"
  ],a:2,e:"CDC streams record change events so external systems can keep data in sync without polling."},
  {c:"INT",d:"Intermediate",q:"A Connected App combined with OAuth 2.0 is used to:",o:[
    "Store CSV files that an external application uploads to Salesforce for later batch processing",
    "Build dashboards that visualize data pulled from an external application",
    "Securely authorize an external application to access Salesforce APIs on a user's behalf",
    "Assign profiles and permission sets to users of an external application"
  ],a:2,e:"Connected Apps define OAuth settings so external apps can authenticate and obtain scoped access tokens to Salesforce."},
  {c:"INT",d:"Advanced",q:"Named Credentials are recommended for Apex callouts because they:",o:[
    "Store the endpoint and authentication together, so credentials aren't hardcoded and auth is automatic",
    "Bypass all of the platform's security controls so the callout can reach any external endpoint at all",
    "Are required before a user can build or run any report in the org",
    "Encrypt every field across the whole org so callout data stays private"
  ],a:0,e:"Named Credentials externalize the endpoint and authentication, removing hardcoded secrets and simplifying secure callouts."},
  {c:"INT",d:"Advanced",q:"An Apex callout to an external service triggered from a trigger must be:",o:[
    "Made asynchronously, via @future or Queueable, since callouts can't run in the trigger transaction",
    "Made synchronously inside the trigger transaction so the response returns before the record saves",
    "Blocked entirely, because triggers may never communicate with outside systems",
    "Performed by running a report that reaches out to the external endpoint"
  ],a:0,e:"You cannot make a callout in the same synchronous transaction that has pending DML from a trigger; do it asynchronously."},
  {c:"INT",d:"Intermediate",q:"Before Apex can call an external endpoint, the endpoint must be authorized via:",o:[
    "A validation rule that permits the record to trigger the callout",
    "A custom report type covering the object involved in the callout",
    "A sharing rule that grants access to the external system's data",
    "Remote Site Settings or a Named Credential registered for that endpoint"
  ],a:3,e:"Salesforce blocks callouts to unregistered endpoints; register them in Remote Site Settings or use a Named Credential."},
  {c:"INT",d:"Advanced",q:"Salesforce Connect and external objects let you:",o:[
    "Copy all of the external data into Salesforce every night through a scheduled overnight batch process",
    "Encrypt the fields on records so their values are unreadable at rest",
    "Build flows that run against the records stored in the external system",
    "Access data stored in an external system in real time without importing it, via protocols like OData"
  ],a:3,e:"Salesforce Connect surfaces external data as external objects, retrieved on demand (e.g., via OData) rather than stored in Salesforce."},
  {c:"INT",d:"Advanced",q:"External Services in Salesforce allow admins to:",o:[
    "Run only custom Apex code, exposing it to external systems through a single REST endpoint",
    "Deploy change sets containing integration metadata between related orgs",
    "Encrypt the data exchanged with an external system during an integration",
    "Import a REST service's schema, like OpenAPI, and invoke it declaratively from Flow"
  ],a:3,e:"External Services register an API via its schema, generating invocable actions usable in Flow — declarative integration."},
  {c:"INT",d:"Intermediate",q:"An outbound message (a workflow action) sends data as:",o:[
    "A REST call carrying the record's fields as a JSON payload",
    "A SOAP message delivered to a specified external endpoint",
    "An email containing the record's details to a list of users",
    "A dashboard summarizing the records that met the criteria"
  ],a:1,e:"Outbound messages transmit a SOAP message with field values to a designated endpoint when workflow criteria are met."},
  {c:"INT",d:"Advanced",q:"The Metadata API is used primarily to:",o:[
    "Query and update customer records such as accounts, contacts, leads, cases, and opportunities",
    "Send transactional and marketing email to customers from the platform",
    "Retrieve, deploy, and update org configuration and metadata between orgs or tools",
    "Route incoming cases and leads to the correct agents and queues"
  ],a:2,e:"The Metadata API manages configuration/metadata for migrations and CI/CD; data APIs (REST/SOAP/Bulk) handle records."},
  {c:"INT",d:"Advanced",q:"The Composite API helps reduce API call consumption by:",o:[
    "Encrypting each request so several can share one secure connection",
    "Bundling multiple related subrequests into a single API call, referencing results between them",
    "Deploying metadata alongside the data so both move in one operation",
    "Scheduling the API jobs to run overnight during the window when traffic on the org is lower"
  ],a:1,e:"Composite requests execute several operations in one round trip, and can reference results between subrequests, saving calls."},
  {c:"INT",d:"Intermediate",q:"MuleSoft's role in the Salesforce ecosystem is primarily as:",o:[
    "Integration middleware and API management connecting Salesforce with other systems",
    "A reporting engine that builds analytics across Salesforce and external data",
    "A sandbox type used to test integrations before they reach production",
    "A test framework for validating Apex callouts against external endpoints"
  ],a:0,e:"MuleSoft (Anypoint Platform) is integration and API-management middleware used to connect Salesforce with external systems."},
  {c:"DEPLOY",d:"Intermediate",q:"Which sandbox type includes a full copy of production data?",o:[
    "Developer, which copies metadata only and includes none of the production data",
    "Developer Pro, which copies metadata with more storage but no production data",
    "Full, which copies all production data and metadata and refreshes about every 29 days",
    "Partial Copy, which copies metadata plus only a sampled subset of production data"
  ],a:2,e:"Only Full sandboxes copy all production data (and metadata); they refresh least often (about every 29 days)."},
  {c:"DEPLOY",d:"Advanced",q:"A Partial Copy sandbox differs from a Full sandbox in that it:",o:[
    "Contains no metadata at all and must be rebuilt from source before each use",
    "Cannot run Apex code, limiting it to configuration and manual testing only",
    "Includes a sampled subset of production data via a template and refreshes more frequently",
    "Is effectively the same as a Developer Edition org that is provided free for learning and testing"
  ],a:2,e:"Partial Copy sandboxes carry metadata plus a sampled data set (via a template) and refresh about every 5 days."},
  {c:"DEPLOY",d:"Intermediate",q:"Developer and Developer Pro sandboxes contain:",o:[
    "Configuration and metadata only, with no production data, differing mainly in storage size",
    "A complete copy of all of the production data together with the full set of org metadata as well",
    "Only the org's reports and dashboards, without any objects, fields, or Apex",
    "No data or metadata until an administrator seeds them from a template file"
  ],a:0,e:"Developer and Developer Pro sandboxes copy metadata but not production data (Dev Pro has more storage); both refresh daily."},
  {c:"DEPLOY",d:"Intermediate",q:"Change sets are used to:",o:[
    "Import CSV data files into both standard and custom objects across all of the connected orgs",
    "Deploy declarative customizations between related orgs that share a deployment connection",
    "Encrypt fields across the connected orgs so their values are protected at rest",
    "Detect and merge duplicate account records shared between the connected orgs"
  ],a:1,e:"Change sets move metadata between related orgs over an authorized deployment connection; they don't move data."},
  {c:"DEPLOY",d:"Advanced",q:"A common limitation of change sets is that they:",o:[
    "They cannot delete components in the target org and don't support every metadata type",
    "They can delete components in the target org but cannot create new ones there",
    "They require the deployment to contain Apex and reject purely declarative changes",
    "They move record data along with metadata, which often overwrites target records"
  ],a:0,e:"Change sets add/update components but cannot delete them in the target, and some metadata types aren't supported."},
  {c:"DEPLOY",d:"Advanced",q:"A managed package (vs an unmanaged package) is characterized by:",o:[
    "Is fully editable by subscribers, who can change its code after installing it",
    "Has a namespace, versioning, upgradeability, and IP protection, used by ISVs on AppExchange",
    "Has no version control, so each new release must be installed as a completely separate package",
    "Can only be deployed once and cannot be upgraded after it is first installed"
  ],a:1,e:"Managed packages are versioned, upgradeable, namespaced, and protect the developer's code — the model for AppExchange products."},
  {c:"DEPLOY",d:"Intermediate",q:"The Salesforce CLI (SFDX) and scratch orgs support which development approach?",o:[
    "Click-only administration performed entirely through the Setup menu",
    "Manual data entry into production without any version control involved",
    "Report and dashboard building as the primary development activity",
    "Source-driven development using disposable, configurable scratch orgs"
  ],a:3,e:"Scratch orgs are short-lived, source-defined environments central to the modern, source-driven (package) development model."},
  {c:"DEPLOY",d:"Advanced",q:"A 'Validate Only' deployment followed by a 'Quick Deploy' is useful because it:",o:[
    "Skips all of the Apex tests entirely so that the deployment finishes as fast as it possibly can",
    "Lets you validate and run tests ahead of time, then deploy quickly without re-running them",
    "Deletes obsolete metadata from the target org before the new components load",
    "Encrypts the deployed components so only administrators can view them later"
  ],a:1,e:"Validation runs tests and checks components; a successful, recent validation can be quick-deployed without re-running the full test suite."},
  {c:"DEPLOY",d:"Advanced",q:"Deploying to a PRODUCTION org differs from deploying to a sandbox in that production:",o:[
    "Production never runs Apex tests, trusting that the sandbox already did",
    "Production cannot receive change sets and accepts only Metadata API deploys",
    "Production ignores validation rules during a deployment to speed it up",
    "Production requires Apex tests to run and meet the coverage threshold"
  ],a:3,e:"Production deployments must run Apex tests and satisfy the 75% coverage requirement; sandboxes can deploy without running tests."},
  {c:"DEPLOY",d:"Intermediate",q:"DevOps Center is Salesforce's tool for:",o:[
    "Build and schedule all of the reports and dashboards that track a team's ongoing releases",
    "Encrypt the metadata moved between orgs so deployments remain confidential",
    "Manage source-driven change and release pipelines with version control integration",
    "Detect and merge duplicate records introduced during a data migration"
  ],a:2,e:"DevOps Center provides a UI for source-tracked, pipeline-based deployments backed by a version control repository."},
  {c:"DEPLOY",d:"Advanced",q:"Unlocked packages are primarily intended for:",o:[
    "Internal, org-specific development with packaged, upgradeable metadata admins can still modify",
    "Third-party AppExchange products whose source code is locked and hidden from all subscribers entirely",
    "Backing up an org's data on a schedule so records can be restored after loss",
    "Routing incoming cases and leads to the correct agents and queues automatically"
  ],a:0,e:"Unlocked packages suit a customer's own/internal development: they're versioned and upgradeable but not IP-locked like managed packages."},
  {c:"DEPLOY",d:"Advanced",q:"When deploying components with change sets, which is TRUE about profiles/permission sets?",o:[
    "They are always deployed in full automatically, carrying every permission they hold",
    "They cannot be included in a change set at all and must be recreated by hand",
    "They deploy only the settings related to components included in the same change set",
    "They deploy the entire org's security model, overwriting the target org's settings"
  ],a:2,e:"In change sets, profile/permission settings deploy only for components that are also present in that change set, which often surprises admins."},
  {c:"DEPLOY",d:"Intermediate",q:"Before promoting a customization from a sandbox to production, a best practice is to:",o:[
    "Deploy the change directly to production with no testing to save time",
    "Edit the production org directly during peak business hours so that users see changes immediately",
    "Delete the sandbox first so it cannot interfere with the production deployment",
    "Build and validate in a sandbox, test, then deploy through a controlled process with coverage"
  ],a:3,e:"The standard lifecycle is build/test in a sandbox, then deploy to production through a controlled process with tests — never edit production ad hoc."},
  {c:"FUND",d:"Foundational",q:"In Lightning Experience, the utility bar is:",o:[
    "A vertical list of every object the running user is permitted to open and edit in the org",
    "The top navigation bar that holds the app's assigned tabs and the App Launcher button",
    "A panel in Setup where administrators configure objects, fields, and record automation",
    "A persistent footer of quick-access tools like Notes, History, and open items across an app"
  ],a:3,e:"The utility bar is a fixed footer in a Lightning app offering productivity tools (Notes, Recent Items, History) available from any page in that app."},
  {c:"FUND",d:"Foundational",q:"A user who wants to change their own password, email, or display settings goes to:",o:[
    "The Setup menu, which every user can open to edit their own personal account details",
    "The Object Manager, where each user maintains their own personal field preferences",
    "Their personal settings, reached from the avatar menu, separate from the admin Setup area",
    "The company information page, which stores the contact details for all of the users"
  ],a:2,e:"Individual users manage their own password, email, and preferences under personal settings (avatar menu). Setup is for org-wide administration."},
  {c:"FUND",d:"Foundational",q:"The bell icon in the Lightning header shows a user:",o:[
    "A list of the records they most recently created, edited, or opened in the org",
    "Their notifications, such as @mentions, approvals awaiting action, and custom alerts",
    "The apps available to them, letting them switch apps and open any tab quickly",
    "A feed of every change made to records across the entire Salesforce org today"
  ],a:1,e:"The notification bell surfaces personal notifications: @mentions, approval requests assigned to the user, and custom notifications sent to them."},
  {c:"FUND",d:"Intermediate",q:"Pinning a list view on an object causes it to:",o:[
    "Become the default view shown whenever the user next opens that object's list",
    "Be shared automatically with every other user who has access to the object",
    "Lock the view's filters so that no other user is able to change them later",
    "Convert the list into a report that can be scheduled and emailed to a team"
  ],a:0,e:"The pinned list view loads by default for that user when they open the object's list; pinning is per user and doesn't share or lock the view."},
  {c:"FUND",d:"Intermediate",q:"The 'split view' option on a list is useful because it:",o:[
    "Displays two different objects next to each other for comparing their records",
    "Keeps the list of records visible in a side panel while you work a record beside it",
    "Splits a single record's fields into two columns so more fits on the screen",
    "Divides a report into two blocks so different groupings appear side by side"
  ],a:1,e:"Split view shows the record list in a narrow left panel next to the open record, so a user can move through the list without leaving the record."},
  {c:"FUND",d:"Advanced",q:"In the Lightning App Builder, the three page types you can create are:",o:[
    "List Page, Detail Page, and Edit Page, one for each record interaction",
    "App Page, Home Page, and Record Page, each targeting a different context",
    "Desktop Page, Mobile Page, and Tablet Page, one per device form factor",
    "Public Page, Internal Page, and Portal Page, one for each audience type"
  ],a:1,e:"Lightning App Builder builds App Pages (single-page apps), Home Pages (an app landing page), and Record Pages (an object's record view)."},
  {c:"FUND",d:"Advanced",q:"Dynamic Forms in the Lightning App Builder let an admin:",o:[
    "Generate a fillable web form that creates records from external website visitors",
    "Build a multi-screen wizard that collects input and writes it to related records",
    "Place individual fields and sections anywhere on a record page with visibility rules",
    "Apply a formula that recalculates a field's value each time the record is opened"
  ],a:2,e:"Dynamic Forms break the layout's field block into individual fields and sections you can position and conditionally show or hide on the record page."},
  {c:"FUND",d:"Advanced",q:"Component visibility rules on a Lightning record page allow a component to:",o:[
    "Move itself to a different region of the page depending on the record owner",
    "Become editable only for users who hold the Modify All Data permission set",
    "Refresh its own data on a schedule without the user having to reload the page",
    "Show or hide based on field values, device, or the viewing user's attributes"
  ],a:3,e:"Component visibility filters conditionally render a component based on record field values, device form factor, or user and permission attributes."},
  {c:"UMA",d:"Foundational",q:"A public group in Salesforce is:",o:[
    "A named set of users, roles, or other groups used to simplify sharing and access",
    "A single user who has been granted administrative rights over other users",
    "A queue that owns records so its members can work them from a shared pool",
    "A profile variant that bundles a department's permissions for quick assignment"
  ],a:0,e:"Public groups collect users, roles, roles-and-subordinates, and other groups into one reusable set, mainly to target sharing rules and folder access."},
  {c:"UMA",d:"Foundational",q:"A Salesforce username must be:",o:[
    "Identical to the user's email on their contact record at all times",
    "Unique only within the user's own org but reusable in another org",
    "Unique across all Salesforce orgs and formatted like an email address",
    "Between eight and sixteen characters with at least one number used"
  ],a:2,e:"Usernames are globally unique across all Salesforce orgs and use an email-like format, though they need not match the user's actual email address."},
  {c:"UMA",d:"Intermediate",q:"A permission set license is required when:",o:[
    "Any permission set at all is assigned to a user on top of their profile",
    "A permission set grants a feature the user's base license doesn't already include",
    "A user is assigned to more than one permission set group within the org at the same time",
    "An administrator clones a profile to create a new one for a set of users"
  ],a:1,e:"Some features need a permission set license before a permission set granting that feature can be assigned; ordinary permission sets don't require one."},
  {c:"UMA",d:"Intermediate",q:"If a user is left without a role assigned, the main consequence is:",o:[
    "They are unable to log in at all until an administrator assigns them a role",
    "They automatically receive the most permissive access to every single object",
    "Their profile is ignored and replaced by the org's default baseline profile",
    "They fall outside the role hierarchy, so their records may not roll up to managers"
  ],a:3,e:"A user with no role can still log in, but hierarchy-based sharing and hierarchy report filters won't roll their records up to managers."},
  {c:"UMA",d:"Intermediate",q:"The 'Manage Users' permission primarily lets an administrator:",o:[
    "View and edit every record that any user in the org owns or can access",
    "Deploy metadata such as new profiles and permission sets between two orgs",
    "Change the org-wide default sharing settings for standard and custom objects",
    "Create and edit users, reset passwords, and assign profiles and permission sets"
  ],a:3,e:"Manage Users covers user administration—creating and editing users, resetting passwords, assigning profiles and permission sets—not record access."},
  {c:"UMA",d:"Advanced",q:"A session-based permission set differs from a standard one in that its access:",o:[
    "Applies to every session but only for users who also hold a matching profile",
    "Is active only during a session that meets a defined activation condition",
    "Cannot be assigned directly and must be delivered through a permission set group",
    "Grants record-level sharing rather than object or field permissions to the user"
  ],a:1,e:"Session-based permission sets activate their permissions only for a qualifying session (e.g., after a specific login flow), rather than persistently."},
  {c:"UMA",d:"Advanced",q:"Before an active user can be deactivated, Salesforce may first require that you:",o:[
    "Delete every single record that the user has ever created across all objects",
    "Reassign items where the user is the sole recipient, such as a workflow or approval assignee",
    "Downgrade the user's profile to a read-only profile and wait out a mandatory holding period first",
    "Transfer the user's license to another active user who sits in the same role"
  ],a:1,e:"Deactivation can be blocked when a user is the recipient of certain items (default workflow/approval assignee, a dashboard running user); reassign those first."},
  {c:"UMA",d:"Advanced",q:"Within a permission set group, a muting permission set is used to:",o:[
    "Add extra permissions that none of the member permission sets contain",
    "Temporarily disable the entire group without unassigning it from users",
    "Remove specific permissions from the group for the users assigned to it",
    "Log which permissions each assigned user actually exercised over time"
  ],a:2,e:"A muting permission set subtracts selected permissions otherwise granted by a permission set group, letting you tailor the group for a subset of users."},
  {c:"UMA",d:"Advanced",q:"Compared with a standard internal user license, an Experience Cloud (community) license generally:",o:[
    "Gives external users limited, role-scoped access to specific objects and data",
    "Provides the same full access as an internal user at a reduced monthly cost",
    "Removes all record-level security so that external users can see every record",
    "Is assigned through a permission set group rather than on the user record itself"
  ],a:0,e:"Experience Cloud licenses grant external users a constrained set of access to designated objects and data, distinct from full internal user licenses."},
  {c:"SEC",d:"Foundational",q:"Setting an object's org-wide default to 'Private' means:",o:[
    "Every user in the org can view the records but only owners are able to edit them",
    "No user, not even the record's owner, can see it until a rule grants them access",
    "Only a record's owner and users above them in the hierarchy can see it by default",
    "All internal users can view and edit the records unless a later rule restricts them"
  ],a:2,e:"Private OWD limits access to the owner (and, via hierarchy, their managers) until sharing rules, teams, or manual sharing open it further."},
  {c:"SEC",d:"Foundational",q:"An org-wide default of 'Public Read Only' for an object means all internal users can:",o:[
    "View and edit every record of the object regardless of who happens to own it",
    "View every record of the object but only the owner and managers can edit them",
    "View only the records that they own, while managers can edit any of the records",
    "Neither view nor edit the records until a sharing rule explicitly grants access"
  ],a:1,e:"Public Read Only lets all users read records but reserves edit rights to the owner and users above them in the role hierarchy."},
  {c:"SEC",d:"Foundational",q:"Whether a user can open and create records for an object at all is controlled by:",o:[
    "Object permissions on their profile or a permission set, such as Read and Create",
    "The org-wide default sharing setting configured for that particular object",
    "The record types that have been assigned to the user for that given object",
    "The role the user occupies within the organization's overall role hierarchy"
  ],a:0,e:"Object-level (CRUD) access comes from profiles and permission sets; OWD, roles, and record types don't grant the base ability to use the object."},
  {c:"SEC",d:"Foundational",q:"Password policies such as minimum length and expiration are set:",o:[
    "On each individual user record by the administrator who creates it",
    "Within the role hierarchy so each role enforces its own password rules",
    "In the personal settings that each user maintains for their own account",
    "In Setup, at the org level, with the option to tighten them per profile"
  ],a:3,e:"Password policies are configured org-wide in Setup and can be made stricter on individual profiles."},
  {c:"SEC",d:"Intermediate",q:"An owner-based sharing rule opens access to records based on:",o:[
    "Who owns the records, sharing them from one group or role to another set of users",
    "The values stored in one or more particular fields on each of the records",
    "The login IP address of the user who is attempting to view the records",
    "Whether any related child records exist beneath each of the parent records"
  ],a:0,e:"Owner-based sharing rules share records owned by members of one group/role/queue with another set of users; criteria-based rules use field values instead."},
  {c:"SEC",d:"Intermediate",q:"If you change an object's OWD from Public Read Only to Private, existing access is:",o:[
    "Left unchanged for existing records and applied only to newly created records",
    "Removed entirely, including even the record owners' access to their own records",
    "Preserved by manual share records that Salesforce creates for every single user",
    "Recalculated, and users lose the access that only the broader default had provided"
  ],a:3,e:"Tightening the OWD triggers sharing recalculation; access that depended on the looser default is revoked, though owners and hierarchy access remain."},
  {c:"SEC",d:"Intermediate",q:"Access to a report or dashboard folder is governed by:",o:[
    "Folder sharing settings that grant viewer, editor, or manager access to users or groups",
    "The org-wide default that applies to the reports' own underlying source objects",
    "Field-level security on the fields that are included in each report or dashboard",
    "The running user that has been assigned to each dashboard stored in the folder"
  ],a:0,e:"Folder sharing controls who can access reports/dashboards in it (Viewer, Editor, Manager), independent of the record-level security on the source data."},
  {c:"SEC",d:"Advanced",q:"Implicit sharing in Salesforce refers to:",o:[
    "Access that an administrator grants by manually sharing each individual record",
    "Built-in access between an account and its related contacts, cases, and opportunities",
    "Sharing that Apex code creates programmatically for a custom business requirement",
    "The automatic access that managers receive through the organization's role hierarchy"
  ],a:1,e:"Implicit sharing is platform-built parent/child access—e.g., account access grants some access to its child records and vice versa—without configured rules."},
  {c:"SEC",d:"Advanced",q:"Apex managed sharing is used when:",o:[
    "An admin needs to share just a single record with one user one time",
    "The org-wide default must be raised above Public Read/Write for an object",
    "Declarative sharing can't express the logic and code must grant record access",
    "Field-level security has to be enforced differently for each record type"
  ],a:2,e:"Apex managed sharing lets developers create share records for requirements declarative rules can't model, and it persists through sharing recalculation."},
  {c:"SEC",d:"Advanced",q:"The object-level 'Modify All' permission differs from the org-wide 'Modify All Data' because it:",o:[
    "Grants full access to every record of one specific object rather than all objects",
    "Allows editing the records of that object but never deleting any of them",
    "Applies only within sandboxes and is ignored in the production environment",
    "Requires the user to also hold a matching role within the org's hierarchy"
  ],a:0,e:"'Modify All' (an object permission) overrides sharing for that single object; 'Modify All Data' does so across every object in the org."},
  {c:"MODEL",d:"Foundational",q:"A custom object in Salesforce is:",o:[
    "A read-only view that combines fields drawn from several standard objects",
    "A field type that references records that are stored in an external system",
    "A layout that arranges the fields shown on a standard object's record page",
    "A table you create to store records for data that is unique to your organization"
  ],a:3,e:"Custom objects are database tables you define to hold records for your org's specific data, with their own fields, relationships, and layouts."},
  {c:"MODEL",d:"Foundational",q:"Which is an example of a standard object provided by Salesforce out of the box?",o:[
    "A Shipment object that your team created to track outbound deliveries",
    "An external Inventory object mapped to a warehouse database via OData",
    "Account, which stores the companies or organizations you do business with",
    "A junction object that joins Students and Courses in a custom app"
  ],a:2,e:"Account is a standard object shipped with Salesforce; the others describe custom or external objects an org would build itself."},
  {c:"MODEL",d:"Foundational",q:"A picklist field is best used when you want users to:",o:[
    "Choose one value from a defined, controlled list of options you provide",
    "Type free-form text that can differ from one record to the next one",
    "Enter a number that the system then uses in later calculations for you",
    "Reference a related record that is stored on a different object entirely"
  ],a:0,e:"Picklists constrain input to a predefined set of values, improving consistency and reporting compared with free-text fields."},
  {c:"MODEL",d:"Intermediate",q:"Compared with a standard Text field, a Long Text Area field:",o:[
    "Stores fewer characters but can be marked unique and indexed for fast matching",
    "Stores far more characters over multiple lines but can't be an external ID or unique",
    "Holds only numeric input and supports roll-up summaries on the parent object",
    "Encrypts its contents automatically so that only some profiles are able to read"
  ],a:1,e:"Long Text Area holds thousands of characters over multiple lines but can't be unique, an external ID, or required the way a Text field can."},
  {c:"MODEL",d:"Intermediate",q:"Which is generally TRUE about changing a custom field's data type after records exist?",o:[
    "Any field type at all can be changed into any other type without ever affecting the data",
    "Field types can never be changed at all once the field has been created",
    "Some conversions are allowed but risk data loss, and many combinations are blocked",
    "Only number and currency fields can be converted, and only to each other"
  ],a:2,e:"Salesforce permits certain type changes (with data-loss warnings) but disallows many, especially to/from auto-number, roll-up, or formula types."},
  {c:"MODEL",d:"Intermediate",q:"A global value set (global picklist) is useful because it:",o:[
    "Automatically translates the picklist values into every user's own language",
    "Lets each individual user create their own private list of picklist values",
    "Stores the picklist selections as encrypted values within the database itself",
    "Defines picklist values once and shares them across multiple picklist fields"
  ],a:3,e:"A global value set centralizes a list of values reused by many picklist fields, so you maintain the options in one place."},
  {c:"MODEL",d:"Intermediate",q:"A lookup filter on a relationship field is used to:",o:[
    "Limit which related records a user is allowed to select in the lookup field",
    "Hide the lookup field entirely from users who are on certain profiles",
    "Automatically populate the lookup based on the value of another field",
    "Convert the lookup into a master-detail relationship when it is saved"
  ],a:0,e:"Lookup filters restrict the set of valid records a user can choose in a lookup, using criteria on the source and target records."},
  {c:"MODEL",d:"Advanced",q:"To convert a lookup relationship into a master-detail relationship, the lookup field must first:",o:[
    "Contain a value on every existing child record, since detail records require a parent",
    "Be removed from every one of the page layouts on which it currently appears",
    "Have field history tracking switched off on both the parent and the child objects first",
    "Be marked as an external ID so that records can be matched to a chosen parent"
  ],a:0,e:"Because detail records can't exist without a master, every child record must already reference a parent before a lookup can become master-detail."},
  {c:"MODEL",d:"Advanced",q:"A cross-object formula field can reference fields:",o:[
    "On any object in the org regardless of whether a relationship exists between",
    "On child records only, aggregating their values much like a roll-up summary",
    "On external objects but never on standard or custom Salesforce objects at all",
    "On parent records up the relationship chain, but not on child records below it"
  ],a:3,e:"Cross-object formulas traverse to parent (and grandparent) records via relationships; aggregating child data needs a roll-up summary instead."},
  {c:"DMGMT",d:"Foundational",q:"Data is most commonly imported into Salesforce from a file in which format?",o:[
    "PDF, a fixed-layout document that preserves the file's original formatting",
    "XML, a tag-based document describing the org's configuration metadata",
    "JSON, the payload format used by the REST API for a single record",
    "CSV, a comma-separated text file with a header row naming the columns"
  ],a:3,e:"Import tools (Data Import Wizard, Data Loader) accept CSV files, where the first row names the columns you map to Salesforce fields."},
  {c:"DMGMT",d:"Foundational",q:"The Salesforce record ID is:",o:[
    "A number the user types in to label each record within its own object",
    "A unique, system-generated identifier assigned to every record when it is created",
    "The record's name field, which has to be unique across the whole object",
    "A field that admins define to match records coming from an external system"
  ],a:1,e:"Every record gets a unique 15- or 18-character Salesforce ID at creation; external IDs, by contrast, are admin-defined matching keys."},
  {c:"DMGMT",d:"Foundational",q:"A record a user accidentally deleted can usually be recovered by:",o:[
    "Re-importing the same CSV file that had originally created the record",
    "Contacting Salesforce support, since deleted records are never recoverable",
    "Opening the Recycle Bin and restoring it within the retention window",
    "Running a report that regenerates the record from its stored field history"
  ],a:2,e:"Deleted records sit in the Recycle Bin for 15 days by default and can be restored from there before they're permanently purged."},
  {c:"DMGMT",d:"Intermediate",q:"The difference between a 15-character and an 18-character Salesforce ID is that the 18-character version is:",o:[
    "Assigned only to custom objects, while standard objects always use fifteen",
    "Reserved for records that are created through the API rather than the UI",
    "Case-insensitive, adding a checksum so tools that ignore case still match correctly",
    "Encrypted, whereas the fifteen-character form is stored as readable plain text"
  ],a:2,e:"The 18-char ID appends a 3-character case-insensitive suffix so systems that don't preserve case (e.g., Excel) can still match IDs reliably."},
  {c:"DMGMT",d:"Intermediate",q:"When using Data Loader to UPDATE existing records, the file must include:",o:[
    "The record ID (or an external ID) so each row matches an existing record",
    "Only the fields being changed, with no identifying column of any kind",
    "A column for every field on the object, even the ones left unchanged",
    "The name of the user who is meant to become the owner of each record"
  ],a:0,e:"Update matches on the Salesforce record ID (or an external ID via upsert); without a matching key, Data Loader can't locate the record to change."},
  {c:"DMGMT",d:"Advanced",q:"When the Bulk API processes a large load, records are handled:",o:[
    "In asynchronous batches processed in parallel, with results retrieved afterward",
    "One record at a time, strictly in the order they appear in the source file",
    "Synchronously, blocking the caller until every record in the file is committed",
    "Only after every single row passes validation, or the whole load is rejected"
  ],a:0,e:"The Bulk API splits the job into batches processed asynchronously and in parallel; you check job and batch status and results after submission."},
  {c:"DMGMT",d:"Advanced",q:"A Big Object in Salesforce is designed to:",o:[
    "Hold one very large individual file, such as a video or a disk image",
    "Store and query hundreds of millions of records without normal storage limits",
    "Combine several standard objects into a single denormalized reporting table",
    "Cache the most frequently used records in memory for faster page loads"
  ],a:1,e:"Big Objects store massive volumes of data (e.g., historical or archival) with a specialized index and query model, separate from standard object storage."},
  {c:"AUTO",d:"Foundational",q:"A flow in Salesforce is:",o:[
    "A chart that visualizes how records move through their various lifecycle stages over a period of time",
    "A report that groups records together so that trends over time are easy to see",
    "A permission that lets a user run existing Apex code without writing any of it",
    "A configurable automation that collects data and performs actions through connected elements"
  ],a:3,e:"Flow is Salesforce's declarative automation tool; you build logic from elements (screens, decisions, record operations) that run in sequence."},
  {c:"AUTO",d:"Foundational",q:"A validation rule is used to:",o:[
    "Automatically fill in a field's value based on other fields on the record",
    "Stop a record from saving when its data fails a condition you have defined",
    "Route a newly created record to the correct owner or queue on creation",
    "Send an email to a user whenever a record is created or later edited"
  ],a:1,e:"Validation rules block the save and show an error when their formula is true, enforcing data quality at the point of entry."},
  {c:"AUTO",d:"Foundational",q:"An approval process is best described as:",o:[
    "A rule that automatically corrects invalid data before the record saves",
    "A report that shows which records were created within a given time period",
    "A defined path that routes a record to approvers who then accept or reject it",
    "A sharing setting that grants managers access to a subordinate's record"
  ],a:2,e:"Approval processes send records through one or more approval steps; approvers act, and configured actions fire on approval, rejection, or recall."},
  {c:"AUTO",d:"Foundational",q:"Workflow rules, now a legacy tool, could perform which of these actions?",o:[
    "Field updates, email alerts, tasks, and outbound messages when criteria were met",
    "Interactive screens that collect input from a user one step at a time",
    "Loops that process each record in a collection a single item at a time",
    "Callouts to external REST web services that return data back into the triggering record"
  ],a:0,e:"Workflow rules supported four actions—field updates, email alerts, tasks, outbound messages—triggered by criteria; Salesforce now steers this to Flow."},
  {c:"AUTO",d:"Intermediate",q:"Setting a record-triggered flow to run 'only when a record is updated to meet the criteria' helps by:",o:[
    "Allowing the flow to skip governor limits entirely during very large data loads",
    "Letting the flow run before validation rules have evaluated the changed record",
    "Guaranteeing the flow processes the records in the exact order they were created",
    "Preventing the flow from re-running each time an unrelated field on the record changes"
  ],a:3,e:"That option runs the flow only on the update that first satisfies the condition, avoiding redundant re-execution on later saves of the same record."},
  {c:"AUTO",d:"Intermediate",q:"In Flow, a formula resource is used to:",o:[
    "Calculate a value at runtime from other flow data without storing it manually",
    "Permanently store a value that the flow then updates as it continues to run",
    "Prompt the user to type a value on an interactive screen during the flow",
    "Query the database for the set of records that match a group of conditions"
  ],a:0,e:"A Flow formula computes a value on demand from other resources; variables store values you set, and Get Records queries the database."},
  {c:"AUTO",d:"Intermediate",q:"If an unhandled error occurs during a record-triggered flow's database operation, Salesforce will:",o:[
    "Roll back the changes made in that transaction and surface an error message",
    "Commit the records that succeeded and silently skip over the failed one",
    "Retry the entire flow automatically until it eventually manages to succeed",
    "Save the changes anyway but flag the record for an administrator to review"
  ],a:0,e:"An unhandled fault rolls back the transaction's database changes; a fault path lets you handle the error more gracefully instead."},
  {c:"AUTO",d:"Intermediate",q:"When several record-triggered flows run on the same object and event, you can control their sequence with:",o:[
    "The alphabetical order of the flows' API names, which the platform enforces",
    "The role of the user who happened to save the record that fired the flows",
    "A trigger order value set on each flow so they run in a defined order",
    "The order in which the flows were originally created within the org itself"
  ],a:2,e:"Each record-triggered flow has a trigger order number; flows on the same object/event run in ascending order (ties fall back to creation order)."},
  {c:"AUTO",d:"Advanced",q:"A platform event-triggered flow runs when:",o:[
    "A user clicks a custom button that has been placed on a record page",
    "A record is created or updated and happens to meet the entry criteria",
    "A platform event message is published, letting the flow react asynchronously",
    "A scheduled time arrives for a batch of matching records to be processed"
  ],a:2,e:"Platform event-triggered flows subscribe to a platform event and execute when a matching event message is published, decoupled from record DML."},
  {c:"AUTO",d:"Advanced",q:"To call custom Apex logic from a flow, the Apex method must be:",o:[
    "Annotated @InvocableMethod so it appears as an action in the Flow builder",
    "Declared as a @future method that returns its result back to the flow",
    "Placed inside a trigger on the same object the flow runs against here",
    "Marked global and exposed through a Visualforce page's page controller"
  ],a:0,e:"@InvocableMethod exposes an Apex method as a callable Flow action, letting declarative flows invoke custom code."},
  {c:"AUTO",d:"Advanced",q:"A schedule-triggered flow (as opposed to a scheduled path) is best for:",o:[
    "Delaying one branch of a record-triggered flow until days after the original trigger",
    "Presenting a user with interactive screens to complete at a scheduled meeting time",
    "Reacting the instant a specific record is created, updated, or deleted in the org",
    "Running a batch of logic on a set frequency, such as nightly, across matching records"
  ],a:3,e:"Schedule-triggered flows run on a defined schedule over a set of records; scheduled paths delay part of a record-triggered flow relative to its trigger."},
  {c:"SALES",d:"Foundational",q:"An Opportunity in Salesforce represents:",o:[
    "A potential sale or deal in progress, tracked by stage toward its close",
    "A company or organization that you do business with over time",
    "A marketing initiative and the leads and contacts that it targets",
    "A customer's question or issue that the support team must resolve"
  ],a:0,e:"Opportunities track individual deals through stages (e.g., Prospecting to Closed Won), with an amount and a close date."},
  {c:"SALES",d:"Foundational",q:"In Salesforce, the relationship between Accounts and Contacts is that:",o:[
    "Accounts are individuals and Contacts are the companies they work at",
    "Contacts are the individual people who are associated with an Account",
    "Accounts and Contacts are simply two names for the same one object",
    "Contacts store the deals while Accounts store the products being sold"
  ],a:1,e:"An Account is typically a company or organization; Contacts are the people related to that Account."},
  {c:"SALES",d:"Foundational",q:"Every Opportunity requires which two pieces of information at minimum?",o:[
    "A product line item and a signed quote attached to the opportunity record",
    "An assigned sales team and an approved discount percentage for the deal",
    "A related support case and a completed customer satisfaction survey score",
    "A stage and a close date, showing where the deal stands and when it should close"
  ],a:3,e:"Opportunities require a Stage and a Close Date; amounts, products, and teams are optional additions."},
  {c:"SALES",d:"Intermediate",q:"Opportunity line items (products on an opportunity) draw their default prices from:",o:[
    "The price book entries in the price book that is selected for that opportunity",
    "The list price typed directly onto each opportunity by the individual rep",
    "A validation rule that calculates the price from the account's pricing tier",
    "The standard cost field that is maintained on each of the product records"
  ],a:0,e:"When you add products to an opportunity, their prices come from the price book entries in the chosen price book, though reps can adjust the sales price."},
  {c:"SALES",d:"Intermediate",q:"During lead conversion, custom lead fields transfer to the new records only if:",o:[
    "They have been marked as required on the lead's own page layout",
    "You map them to fields on the Account, Contact, or Opportunity beforehand",
    "The converting user holds the Modify All Data permission at the time",
    "The lead and the target records happen to share the same record type"
  ],a:1,e:"Standard fields map automatically, but custom lead fields carry over only if an admin has configured lead field mapping to the target objects."},
  {c:"SALES",d:"Intermediate",q:"The forecast category on an opportunity (e.g., Pipeline, Best Case, Commit) is:",o:[
    "Derived from the stage but adjustable, and used to roll deals into a forecast",
    "Set only by managers and hidden from the sales reps who own the deals",
    "A required field that blocks the save until the rep selects a category first",
    "The exact same thing as the opportunity's probability percentage value shown"
  ],a:0,e:"Each stage maps to a default forecast category, which reps or managers can adjust; forecasts aggregate opportunities by these categories."},
  {c:"SALES",d:"Advanced",q:"To sell the same product at different prices to different segments, you would typically:",o:[
    "Add several separate list-price fields directly to the one product record",
    "Create multiple price books, each with its own price book entry for the product",
    "Build a validation rule that changes the price based on the account viewing",
    "Give the product multiple record types, one for each pricing segment you sell"
  ],a:1,e:"Custom price books let you maintain distinct prices for the same product across segments or markets; each price book has its own entries."},
  {c:"SALES",d:"Advanced",q:"Enterprise Territory Management is used to:",o:[
    "Restrict which countries a Salesforce org is legally allowed to operate within",
    "Divide the org into separate instances, one for each regional sales team to use",
    "Assign accounts and their opportunities to sales territories and grant access by territory",
    "Encrypt account data so that only the sales reps in a given region are ever able to read it"
  ],a:2,e:"Territory Management models sales territories, assigns accounts (and thereby opportunities) to them, and can drive record access by territory."},
  {c:"SERVICE",d:"Foundational",q:"Service Cloud is the part of Salesforce focused on:",o:[
    "Customer support and case management across channels like email, phone, and chat",
    "Marketing campaigns and tracking their influence on the sales pipeline",
    "Building custom mobile applications for field sales representatives to use",
    "Managing product catalogs, price books, and the generation of customer quotes"
  ],a:0,e:"Service Cloud provides support capabilities—cases, knowledge, channels, routing—for helping customers after the sale."},
  {c:"SERVICE",d:"Foundational",q:"The Priority field on a case is typically used to:",o:[
    "Record which agent originally created the case within the support system",
    "Indicate how urgent the case is so agents work the most important ones first",
    "Store the customer's satisfaction rating once the case has been closed out",
    "Determine the org-wide default sharing setting applied to that case record"
  ],a:1,e:"Priority (e.g., High/Medium/Low) signals urgency to help agents and routing decide what to handle first."},
  {c:"SERVICE",d:"Intermediate",q:"A case assignment rule differs from a case escalation rule in that assignment rules:",o:[
    "Reassign or notify only after a time-based service threshold is missed",
    "Send an automatic acknowledgment email to the customer who submitted it",
    "Define which status values are available for that particular type of case",
    "Route a case to an owner or queue at the time it is created or edited"
  ],a:3,e:"Assignment rules set the case owner up front based on criteria; escalation rules act later, on time-based conditions like SLA breaches."},
  {c:"SERVICE",d:"Intermediate",q:"A case team is used to:",o:[
    "Group agents so that cases route evenly among them from a shared queue",
    "Define the milestones that together make up a service-level agreement",
    "Replace the role hierarchy for all case sharing throughout the entire org",
    "Add users with defined roles and access to collaborate on a specific case"
  ],a:3,e:"Case teams add collaborators (with roles and access levels) to individual cases, similar to opportunity and account teams."},
  {c:"SERVICE",d:"Intermediate",q:"On-Demand Email-to-Case differs from standard Email-to-Case in that it:",o:[
    "Routes email through Salesforce without an on-premise email agent to install",
    "Works only for internal users emailing from inside the company network",
    "Creates leads instead of cases from the inbound customer email messages",
    "Requires each customer to log in before their email will become a case"
  ],a:0,e:"On-Demand Email-to-Case handles inbound mail entirely in Salesforce (no local agent), with some volume limits, unlike standard Email-to-Case."},
  {c:"SERVICE",d:"Advanced",q:"Skills-based routing in Omni-Channel assigns work by:",o:[
    "Sending every new work item to whichever agent has the longest idle time",
    "Matching the skills a work item requires to the skills that agents possess",
    "Distributing items strictly in a round-robin across all of the online agents",
    "Routing based only on the queue that the work item was originally placed into"
  ],a:1,e:"Skills-based routing matches required skills on the work item to agents' assigned skills and capacity, rather than simple queue or availability routing."},
  {c:"SERVICE",d:"Advanced",q:"A milestone within an entitlement process can trigger:",o:[
    "A change to the case's org-wide default record sharing setting",
    "Time-dependent actions when it is met, missed (violated), or approaching its target",
    "The automatic conversion of the case into a new knowledge article",
    "A callout that creates the matching entitlement record on an external billing system"
  ],a:1,e:"Milestones support success, warning, and violation actions (e.g., notify, escalate) based on their target time, enforcing SLA steps."},
  {c:"ANALYTICS",d:"Foundational",q:"A report in Salesforce is:",o:[
    "A saved set of field values that is applied to many records at once",
    "A snapshot backup of the org's entire data set that is taken on a fixed schedule",
    "A list of records meeting criteria, which can be grouped, filtered, and charted",
    "A dashboard component that refreshes itself on a fixed time interval"
  ],a:2,e:"Reports return records matching filters and can be grouped, summarized, and visualized; dashboards then display report data graphically."},
  {c:"ANALYTICS",d:"Foundational",q:"A summary report differs from a tabular report because it:",o:[
    "Contains only a single column of data with no filters applied to it",
    "Displays a grid grouped by both rows and columns at the same time",
    "Cannot be used as the source for any dashboard component at all",
    "Groups rows of records together and can show subtotals for each group"
  ],a:3,e:"Summary reports group records into rows with subtotals; tabular is a flat list, and matrix groups by both rows and columns."},
  {c:"ANALYTICS",d:"Foundational",q:"A dashboard in Salesforce is:",o:[
    "A single report that is displayed in a full-screen printable format",
    "A visual arrangement of components, each showing data from a source report",
    "A folder that stores a set of related reports for a team to share",
    "A scheduled export of report data that is delivered to users as a file"
  ],a:1,e:"Dashboards present multiple components (charts, gauges, tables) that each draw from a source report to give an at-a-glance view."},
  {c:"ANALYTICS",d:"Intermediate",q:"A gauge dashboard component is most appropriate for showing:",o:[
    "A single value's progress toward a target, such as sales against a quota",
    "How one value has trended across many months of stored history",
    "The breakdown of records across several different grouped categories",
    "A detailed table of individual records and each of their field values"
  ],a:0,e:"Gauges depict one metric against defined ranges/targets (e.g., quota attainment); trends suit line charts and breakdowns suit bar or donut charts."},
  {c:"ANALYTICS",d:"Intermediate",q:"Using a relative date filter such as 'THIS QUARTER' in a report is preferable because it:",o:[
    "Keeps the report current automatically without editing fixed dates each period",
    "Runs the report much faster by scanning far fewer of the records in the whole database",
    "Lets the report ignore the running user's own data access settings",
    "Converts the report from a tabular format to a matrix format for you"
  ],a:0,e:"Relative date literals (e.g., THIS QUARTER, LAST 7 DAYS) update automatically as time passes, so you needn't edit hard-coded dates."},
  {c:"ANALYTICS",d:"Intermediate",q:"A row-level formula in a report calculates a value:",o:[
    "Across grouped subtotals and the report's grand total only",
    "Only after the report has been added to a dashboard component",
    "For each individual record row, using the fields on that record",
    "By querying related child records that don't appear in the report"
  ],a:2,e:"Row-level formulas compute per record row; custom summary formulas operate on grouped or summary values instead."},
  {c:"ANALYTICS",d:"Intermediate",q:"Adding a report chart component to a Lightning record page lets users:",o:[
    "Edit the underlying report's groupings directly from the record page",
    "See a chart filtered to the record they are currently viewing, in context",
    "Export the record and its related list out to a spreadsheet file",
    "Schedule the record to refresh its own related data every single hour"
  ],a:1,e:"An embedded report chart can filter by the record in context (via a matching field), giving relevant analytics right on the record page."},
  {c:"ANALYTICS",d:"Advanced",q:"A reporting snapshot (analytic snapshot) is configured to:",o:[
    "Take a full backup of the org's data and store it in an external location",
    "Cache a dashboard so viewers can load it faster during peak usage hours",
    "Run a source report on a schedule and write its results into a custom object",
    "Capture field history automatically for every field that is being tracked"
  ],a:2,e:"Reporting snapshots schedule a report and load its rows into a custom object over time, enabling historical trend analysis you build yourself."},
  {c:"ANALYTICS",d:"Advanced",q:"Compared with standard reports and dashboards, CRM Analytics (formerly Tableau CRM) is suited to:",o:[
    "Exploring large, blended data sets with interactive, drillable dashboards",
    "Enforcing field-level security on the org's standard and custom objects",
    "Deploying report and dashboard metadata between a sandbox and production",
    "Removing the need for any custom objects to exist in the org's data model"
  ],a:0,e:"CRM Analytics handles large, combined data volumes with interactive exploration beyond what standard reports and dashboards provide."},
  {c:"PROD",d:"Foundational",q:"The difference between a Task and an Event is that a Task:",o:[
    "Is logged after the fact, while an Event can only ever be scheduled ahead",
    "Is visible to the user's managers, while an Event stays private to its owner",
    "Is a to-do with a due date, while an Event has a specific start and end time",
    "Appears only on records, while an Event can appear only on the user calendar"
  ],a:2,e:"Tasks are to-dos (with a due date); Events are calendar entries with start/end times. Both are Activities and can relate to records."},
  {c:"PROD",d:"Foundational",q:"Enhanced Notes in Lightning let a user:",o:[
    "Store only plain text that is visible to the system administrators",
    "Attach a note that then automatically deletes itself after fifteen days",
    "Send the note as an email to everyone who follows the related record",
    "Write rich-text notes and relate a single note to more than one record"
  ],a:3,e:"Enhanced Notes support rich text and can be linked to more than one record, unlike the legacy Notes and Attachments feature."},
  {c:"PROD",d:"Foundational",q:"The activity timeline on a record shows:",o:[
    "A history of every field value that has ever changed on the given record",
    "Past and upcoming activities like calls, emails, tasks, and events for that record",
    "A list of all of the users who currently follow the record in Chatter",
    "The full deployment history of the object that the given record happens to belong to"
  ],a:1,e:"The activity timeline consolidates a record's related activities—logged calls, emails, tasks, events—in chronological order."},
  {c:"PROD",d:"Intermediate",q:"A key advantage of Lightning email templates over older Classic text templates is that they:",o:[
    "Support rich formatting and reusable content built with an enhanced editor",
    "Can be sent only to internal users and never to any external contacts",
    "Automatically encrypt the message before it ever reaches the recipient",
    "Require Apex code in order to insert any merge field into the message"
  ],a:0,e:"Lightning email templates offer a richer editor with formatting and reusable components; merge fields still personalize them without code."},
  {c:"PROD",d:"Intermediate",q:"The Outlook and Gmail integrations for Salesforce let users:",o:[
    "Replace Salesforce email templates with their own personal signatures",
    "Deploy metadata changes to the production org directly from an email",
    "View and log Salesforce records and emails from within their inbox",
    "Grant record access to anyone that they happen to send an email to"
  ],a:2,e:"The email integrations surface relevant Salesforce records in Outlook/Gmail and let users log emails and events to records without switching apps."},
  {c:"PROD",d:"Advanced",q:"A global (quick) action added to the publisher lets users:",o:[
    "Create records or log activities quickly from many pages in just a few clicks",
    "Deploy a change set that contains the action into another connected org",
    "Bypass validation rules when creating the record from that quick action",
    "Grant themselves access to records that they could not otherwise see"
  ],a:0,e:"Global and quick actions provide fast create/log flows available across the app (or per object), streamlining common tasks; validation still applies."},
  {c:"PROD",d:"Advanced",q:"A Chatter group that allows customers (external users) is characterized by the fact that it:",o:[
    "Automatically grants those customers access to all of the internal records",
    "Is simply the same thing as a public group used in the org's sharing rules",
    "Brings in people outside the company, so members are added deliberately and posts stay in the group",
    "Can be freely joined by any internal user at all without needing the group owner's approval first"
  ],a:2,e:"Groups that allow customers bring external users into a controlled space; membership is managed and content is confined to the group, granting no record access."},
  {c:"DEV",d:"Foundational",q:"An Apex trigger is code that runs:",o:[
    "Only when a user clicks a specific custom button on a record page",
    "Only on a fixed schedule that the administrator sets up and configures within the Setup menu",
    "Automatically before or after records are inserted, updated, deleted, or undeleted",
    "Whenever a report or dashboard containing the object is refreshed"
  ],a:2,e:"Triggers execute automatically on DML events (before/after insert, update, delete, undelete) for their object."},
  {c:"DEV",d:"Foundational",q:"SOQL is used in Salesforce to:",o:[
    "Design the layout of the fields that are shown on a record page",
    "Define which users are able to access an object and its records",
    "Style the visual appearance and layout of a Lightning web component's own markup",
    "Retrieve records and their fields from the database with a query language"
  ],a:3,e:"SOQL (Salesforce Object Query Language) queries records and fields from Salesforce objects, similar in spirit to SQL SELECT statements."},
  {c:"DEV",d:"Foundational",q:"In Apex, a Boolean variable can hold which values?",o:[
    "true, false, or null when it has not yet been assigned any value",
    "Any whole number, where zero means false and one means true",
    "A short piece of text such as 'yes' or 'no' entered by the user",
    "A list of the records that were returned from a SOQL query run"
  ],a:0,e:"Apex Booleans are true, false, or null (when unassigned); they aren't numeric or text values."},
  {c:"DEV",d:"Intermediate",q:"Trigger context variables like Trigger.isBefore and Trigger.isInsert are used to:",o:[
    "Increase the governor limits that are made available to the trigger's own transaction",
    "Automatically bulkify the trigger so that writing loops becomes unnecessary",
    "Grant the trigger access to records outside the running user's own sharing",
    "Determine which event and timing fired the trigger so logic runs in the right context"
  ],a:3,e:"Context variables let one trigger branch by operation (insert/update/delete) and timing (before/after), a core part of the handler pattern."},
  {c:"DEV",d:"Intermediate",q:"Within the save order of execution, which generally runs later?",o:[
    "Validation rules always run after every Apex trigger has finished running",
    "Roll-up summary recalculation happens before any trigger fires on the record",
    "After-save record-triggered flows run after most before and after Apex triggers",
    "Before-save flows run after after-save triggers on the very same record"
  ],a:2,e:"The order of execution runs before-save flows and before triggers early, then after triggers, then after-save flows near the end of the save."},
  {c:"DEV",d:"Intermediate",q:"To retrieve an Account and its related Contacts in one SOQL query, you use:",o:[
    "Two separate SOSL searches that are combined together with a UNION keyword",
    "A nested subquery, such as SELECT Name, (SELECT LastName FROM Contacts) FROM Account",
    "A roll-up summary field that returns each of the child records inline for you",
    "Dot notation like Account.Contacts.LastName written in the query SELECT clause"
  ],a:1,e:"Parent-to-child queries use a nested subquery on the child relationship name; child-to-parent uses dot notation instead."},
  {c:"DEV",d:"Intermediate",q:"An Apex Map is most useful when you need to:",o:[
    "Store an ordered list of values that is allowed to contain duplicate entries",
    "Guarantee that values stay unique without associating them to any keys",
    "Look up values quickly by a unique key, such as a record ID mapped to a record",
    "Run a SOQL query and iterate over its rows strictly in database order"
  ],a:2,e:"Maps store key-value pairs for fast lookups (e.g., Map of Id to Account); Lists keep order and allow duplicates, and Sets store unique values."},
  {c:"DEV",d:"Intermediate",q:"A try/catch block in Apex is used to:",o:[
    "Increase the number of SOQL queries that are allowed in the transaction",
    "Catch and handle runtime exceptions so the code can respond instead of failing",
    "Run a block of code repeatedly until some condition finally becomes true",
    "Schedule a block of code to execute asynchronously at some later time"
  ],a:1,e:"try/catch handles exceptions gracefully (log, message, recover); it doesn't change limits, loop, or schedule execution."},
  {c:"DEV",d:"Intermediate",q:"SOSL is the better choice over SOQL when you need to:",o:[
    "Retrieve a precise set of records from one object using exact field filters",
    "Aggregate values such as sums and counts grouped by a particular field",
    "Traverse from a child record up to fields on its related parent record",
    "Search text across several objects at once, such as a global keyword search"
  ],a:3,e:"SOSL performs full-text search across multiple objects; SOQL is better for precise, filtered retrieval and relationship traversal on a known object."},
  {c:"DEV",d:"Advanced",q:"Queueable Apex is often preferred over a @future method because it:",o:[
    "Runs synchronously so the results are available immediately in the same call",
    "Bypasses governor limits entirely for very large asynchronous data operations",
    "Can be called only from inside a trigger and never from another Apex class",
    "Supports non-primitive inputs, job chaining, and a returned job ID to monitor"
  ],a:3,e:"Queueable accepts sObjects and complex types, can be chained, and returns a job ID for tracking—advantages over @future's primitive-only model."},
  {c:"DEV",d:"Advanced",q:"To unit-test Apex that makes an HTTP callout, developers:",o:[
    "Supply a mock response with HttpCalloutMock, since real callouts aren't allowed in tests",
    "Allow the test method to call the live external endpoint directly and then assert its response",
    "Wrap the callout inside Test.startTest so that the real request is permitted",
    "Disable the callout in production but leave it running during the test method"
  ],a:0,e:"Apex tests can't make real callouts; you implement HttpCalloutMock (or WebServiceMock) and register it with Test.setMock to simulate responses."},
  {c:"DEV",d:"Advanced",q:"A common way to prevent an Apex trigger from re-entering itself and looping is to:",o:[
    "Use a static Boolean flag that guards the logic from running twice per transaction",
    "Move all of the trigger's SOQL queries to run inside of a large for loop",
    "Declare the trigger to run 'without sharing' so it skips any recalculation",
    "Increase the DML statement limit for the whole transaction from within Setup"
  ],a:0,e:"A static flag (reset per transaction) is a standard recursion guard so updates the trigger makes don't re-invoke the same logic endlessly."},
  {c:"INT",d:"Foundational",q:"In an integration context, an API is:",o:[
    "A defined interface that lets separate software systems exchange data programmatically",
    "A report that summarizes how records changed across two connected systems",
    "A user license that permits logging in from an external application only",
    "A sandbox environment that is used to test how two systems will connect together before go-live"
  ],a:0,e:"An API (application programming interface) is the interface through which systems request and exchange data programmatically."},
  {c:"INT",d:"Foundational",q:"JSON, commonly used with Salesforce's REST API, is:",o:[
    "A programming language that is used to write Salesforce Apex triggers",
    "A lightweight text format for structuring data exchanged between systems",
    "A protocol that encrypts the data as it travels across the open network",
    "A type of report that exports records out for later external analysis work"
  ],a:1,e:"JSON is a lightweight, human-readable data-interchange format; the REST API sends and receives records as JSON."},
  {c:"INT",d:"Foundational",q:"An 'integration user' in Salesforce is typically:",o:[
    "A permission that lets any user connect external systems whenever they like",
    "A special license that removes all API call limits for the entire org at once",
    "A dedicated user account an external system authenticates as to access the org",
    "A queue that holds the records that arrive from the connected external systems"
  ],a:2,e:"Integrations commonly authenticate as a dedicated integration user, isolating and controlling the access an external system has to the org."},
  {c:"INT",d:"Intermediate",q:"Salesforce enforces a limit on the number of API calls an org can make in a rolling 24-hour period, which primarily:",o:[
    "Restricts how many records a single SOQL query is able to return at once",
    "Limits the number of Apex triggers that may run during one transaction",
    "Controls how frequently scheduled reports can be emailed out to the users",
    "Caps total inbound API requests based on the org's edition and user licenses"
  ],a:3,e:"Orgs have a 24-hour API request allocation (by edition and licenses); exceeding it blocks further API calls until the window rolls over."},
  {c:"INT",d:"Intermediate",q:"The OAuth JWT bearer flow is well suited to:",o:[
    "A mobile app where the user taps to authorize the access each time",
    "Encrypting all of the record data that passes through the integration layer itself",
    "Server-to-server integration where no user is present to log in interactively",
    "Deploying metadata between a sandbox and the production org securely"
  ],a:2,e:"The JWT bearer flow authenticates server-to-server (using a certificate) without interactive login, ideal for backend and system integrations."},
  {c:"INT",d:"Intermediate",q:"With Salesforce Connect, external object data is:",o:[
    "Copied into Salesforce every night and then refreshed on a set schedule",
    "Fetched live from the source system each time it is viewed, not stored in Salesforce",
    "Encrypted at rest inside of Salesforce for the sake of meeting regulatory compliance rules",
    "Available only through Apex code and never on any standard page layouts"
  ],a:1,e:"Salesforce Connect surfaces external data on demand (e.g., via OData); the data stays in the source system rather than being imported."},
  {c:"INT",d:"Intermediate",q:"Platform events are delivered to subscribers using:",o:[
    "An event bus that subscribers listen to, receiving messages as they are published",
    "A nightly batch file that lists out every single one of the events from the prior day",
    "A direct database link that each of the subscribers queries on its own",
    "An email alert that is sent to each subscriber whenever an event occurs"
  ],a:0,e:"Platform events use a streaming event bus (pub/sub); subscribers (Apex, flows, external clients) receive messages in near real time."},
  {c:"INT",d:"Advanced",q:"The Salesforce Pub/Sub API is designed to:",o:[
    "Replace SOQL for querying very large volumes of standard object records",
    "Let external clients publish and subscribe to events efficiently over gRPC",
    "Deploy metadata and code between orgs as part of a CI/CD pipeline",
    "Encrypt all of the inbound API traffic using the platform's certificates"
  ],a:1,e:"The Pub/Sub API is a single gRPC-based interface for publishing and subscribing to platform events and change data capture events efficiently."},
  {c:"DEPLOY",d:"Foundational",q:"A sandbox in Salesforce is:",o:[
    "A backup file of the production org's data stored off the platform",
    "A free developer org that is unable to connect to the production org",
    "A copy of an org used to build and test changes away from production",
    "A tool that deploys metadata changes directly into the production org"
  ],a:2,e:"Sandboxes are separate copies of a production org (metadata, and sometimes data) for development, testing, and training without touching live data."},
  {c:"DEPLOY",d:"Foundational",q:"In deployment terms, 'metadata' refers to:",o:[
    "The customer and business records that are stored within the org's objects",
    "The login credentials belonging to each of the users in the org's directory",
    "The reports and dashboards that a team has built for its own analysis work",
    "The configuration and customizations of an org, such as objects, fields, and code"
  ],a:3,e:"Metadata is the org's configuration (objects, fields, layouts, code); data is the records. Deployment tools move metadata, not records."},
  {c:"DEPLOY",d:"Foundational",q:"The production org is:",o:[
    "The live environment where users do their real work on real business data",
    "A disposable environment that is created fresh for each new project",
    "The environment where all of the Apex tests are skipped just for speed",
    "A copy that refreshes itself from a sandbox every twenty-nine days"
  ],a:0,e:"Production is the live org running the business; sandboxes are non-live copies used to prepare changes before deploying to production."},
  {c:"DEPLOY",d:"Intermediate",q:"Which pairing correctly matches a deployment approach to its nature?",o:[
    "Change sets require a version-control repository, while SFDX needs none",
    "Change sets are point-and-click between related orgs; SFDX/CLI is source-driven",
    "Both change sets and SFDX are able to deploy Apex, but not configuration",
    "Change sets move the data records, while SFDX moves only the metadata"
  ],a:1,e:"Change sets are declarative deployments between connected orgs; the Salesforce CLI/SFDX supports source-driven, version-controlled deployments."},
  {c:"DEPLOY",d:"Intermediate",q:"When deploying to production, the 'Run Local Tests' option:",o:[
    "Runs the tests in your org but skips tests from installed managed packages",
    "Runs no tests whatsoever so that the deployment finishes much faster",
    "Runs only the single test class that you select for that one deployment",
    "Runs every test in every org that is connected by a deployment link"
  ],a:0,e:"Run Local Tests executes all tests in your namespace/org but excludes managed-package tests; Run All Tests includes those too."},
  {c:"DEPLOY",d:"Intermediate",q:"Refreshing a sandbox does what to its contents?",o:[
    "Merges the sandbox's changes back into the production org automatically",
    "Replaces it with a fresh copy of production, discarding prior sandbox changes",
    "Adds the newest production data while keeping the sandbox's customizations",
    "Deletes the sandbox permanently so that a brand-new one must be created"
  ],a:1,e:"A refresh overwrites the sandbox with a current copy of production (per its type), so unsaved or unmigrated sandbox work is lost."},
  {c:"DEPLOY",d:"Advanced",q:"Second-generation packaging (2GP) is primarily used to:",o:[
    "Deploy record data alongside metadata between two closely related orgs",
    "Develop modular, version-controlled packages of metadata for repeatable deployment",
    "Grant end users the ability to directly edit the managed-package code inside the org",
    "Replace sandboxes entirely with disposable scratch orgs for all testing"
  ],a:1,e:"2GP (unlocked and managed) organizes metadata into versioned, source-controlled packages you can build, install, and upgrade repeatably."},
  {c:"DEPLOY",d:"Advanced",q:"In a Salesforce CI/CD pipeline, automated tests are typically run:",o:[
    "Only once, by hand, in the days just before the annual major release",
    "After deploying to production, since sandboxes are unable to run tests",
    "Only when the org's overall code coverage has already dropped below 75%",
    "On each change before it is promoted, so regressions are caught early"
  ],a:3,e:"CI/CD runs automated validation and tests on each committed change so problems surface before promotion to the next environment."}
];

const EXAM_PLAN = {
  FUND: { Foundational: 7, Intermediate: 4, Advanced: 2 },
  UMA: { Foundational: 4, Intermediate: 6, Advanced: 4 },
  SEC: { Foundational: 2, Intermediate: 7, Advanced: 7 },
  MODEL: { Foundational: 2, Intermediate: 7, Advanced: 5 },
  DMGMT: { Foundational: 2, Intermediate: 5, Advanced: 4 },
  AUTO: { Foundational: 2, Intermediate: 8, Advanced: 7 },
  SALES: { Foundational: 3, Intermediate: 7, Advanced: 3 },
  SERVICE: { Foundational: 2, Intermediate: 6, Advanced: 4 },
  ANALYTICS: { Foundational: 2, Intermediate: 7, Advanced: 5 },
  PROD: { Foundational: 4, Intermediate: 5, Advanced: 2 },
  DEV: { Foundational: 2, Intermediate: 8, Advanced: 10 },
  INT: { Foundational: 2, Intermediate: 5, Advanced: 6 },
  DEPLOY: { Foundational: 2, Intermediate: 5, Advanced: 5 }
};
const EXAM_SIZE = 180;

/* ============================================================================
   COMPONENT
   ==========================================================================*/

const TIER_STYLES = {
  amber:  { badge:"bg-amber-100 text-amber-900 border-amber-300",  bar:"bg-amber-500",  ring:"ring-amber-400/40", text:"text-amber-700" },
  violet: { badge:"bg-violet-100 text-violet-900 border-violet-300", bar:"bg-violet-500", ring:"ring-violet-400/40", text:"text-violet-700" },
  indigo: { badge:"bg-indigo-100 text-indigo-900 border-indigo-300", bar:"bg-indigo-500", ring:"ring-indigo-400/40", text:"text-indigo-700" },
  teal:   { badge:"bg-teal-100 text-teal-900 border-teal-300",     bar:"bg-teal-500",   ring:"ring-teal-400/40",  text:"text-teal-700" },
  sky:    { badge:"bg-sky-100 text-sky-900 border-sky-300",        bar:"bg-sky-500",    ring:"ring-sky-400/40",   text:"text-sky-700" },
  slate:  { badge:"bg-slate-100 text-slate-800 border-slate-300",  bar:"bg-slate-500",  ring:"ring-slate-400/40", text:"text-slate-600" },
};

const scoreColor = (pct) =>
  pct >= 80 ? { bar:"bg-emerald-500", text:"text-emerald-700", chip:"bg-emerald-100 text-emerald-800" }
: pct >= 60 ? { bar:"bg-lime-500",    text:"text-lime-700",    chip:"bg-lime-100 text-lime-800" }
: pct >= 40 ? { bar:"bg-amber-500",   text:"text-amber-700",   chip:"bg-amber-100 text-amber-800" }
: pct >= 20 ? { bar:"bg-orange-500",  text:"text-orange-700",  chip:"bg-orange-100 text-orange-800" }
:             { bar:"bg-rose-500",    text:"text-rose-700",    chip:"bg-rose-100 text-rose-800" };

const optionLetter = (i) => String.fromCharCode(65 + i);

/* Every question carries four real options (indices 0-3). Index 4 is reserved
   across the whole bank for an explicit "Unsure" choice, so a user can decline
   to guess instead of scoring correct by chance. Unsure never counts as
   correct, but it is tracked separately from a wrong answer and from a skip. */
const UNSURE = 4;
const UNSURE_LABEL = "Unsure — I don't know this one";

/* ----------------------------------------------------------------------------
   EXAM ASSEMBLY
   Each attempt draws a fresh test from the full bank. For every
   category x difficulty cell, EXAM_PLAN says how many to pull; the specific
   questions are chosen at random, so the composition is fixed (even coverage)
   while the questions themselves rotate between attempts.
   --------------------------------------------------------------------------*/
const DIFFS = ["Foundational", "Intermediate", "Advanced"];

function shuffleInPlace(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function drawExam() {
  // bucket the bank by category|difficulty
  const cells = {};
  for (const q of QUESTIONS) {
    const k = q.c + "|" + q.d;
    (cells[k] = cells[k] || []).push(q);
  }
  const picked = [];
  for (const c of Object.keys(EXAM_PLAN)) {
    for (const d of DIFFS) {
      const want = EXAM_PLAN[c][d] || 0;
      if (!want) continue;
      const pool = (cells[c + "|" + d] || []).slice();
      shuffleInPlace(pool);
      for (let i = 0; i < want && i < pool.length; i++) picked.push(pool[i]);
    }
  }
  return shuffleInPlace(picked); // randomize presentation order across the whole test
}

// assign per-session ids (answers are keyed by these)
function withIds(list) {
  return list.map((q, i) => ({ ...q, id: i }));
}

export default function SalesforceProficiencyExam() {
  const [phase, setPhase] = useState("intro"); // intro | exam | results
  const [answers, setAnswers] = useState({});   // id -> optionIndex
  const [current, setCurrent] = useState(0);
  const [showPalette, setShowPalette] = useState(false);
  const [confirmSubmit, setConfirmSubmit] = useState(false);

  // review filters
  const [reviewCat, setReviewCat] = useState("all");
  const [incorrectOnly, setIncorrectOnly] = useState(false);

  // the drawn test for this attempt: a fresh random subset of the bank,
  // re-drawn each time the exam starts (see startExam)
  const [questions, setQuestions] = useState(() => withIds(drawExam()));

  const total = questions.length;
  const answeredCount = Object.keys(answers).length;
  const scrollRef = useRef(null);

  const catList = useMemo(() => Object.keys(CATEGORIES), []);

  const catCounts = useMemo(() => {
    const m = {};
    for (const q of questions) m[q.c] = (m[q.c] || 0) + 1;
    return m;
  }, [questions]);

  const select = useCallback((qid, optIdx) => {
    setAnswers((a) => ({ ...a, [qid]: optIdx }));
  }, []);

  const goto = useCallback((idx) => {
    setCurrent(Math.max(0, Math.min(total - 1, idx)));
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [total]);

  // keyboard nav during exam
  useEffect(() => {
    if (phase !== "exam") return;
    const handler = (e) => {
      if (confirmSubmit) return;
      const q = questions[current];
      if (["1","2","3","4","5"].includes(e.key)) {
        const i = parseInt(e.key, 10) - 1;
        if (i < q.o.length || i === UNSURE) select(q.id ?? current, i);
      } else if (["a","b","c","d","e"].includes(e.key.toLowerCase())) {
        const i = e.key.toLowerCase().charCodeAt(0) - 97;
        if (i < q.o.length || i === UNSURE) select(q.id ?? current, i);
      } else if (e.key === "ArrowRight") { goto(current + 1); }
      else if (e.key === "ArrowLeft") { goto(current - 1); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [phase, current, confirmSubmit, select, goto, questions]);

  const results = useMemo(() => {
    let correct = 0, unsure = 0, skipped = 0;
    const perCat = {};
    for (const k of catList) perCat[k] = { correct: 0, total: 0, unsure: 0 };
    for (const q of questions) {
      perCat[q.c].total += 1;
      const chosen = answers[q.id];
      if (chosen === undefined) { skipped += 1; continue; }
      if (chosen === UNSURE) { unsure += 1; perCat[q.c].unsure += 1; continue; }
      if (chosen === q.a) { correct += 1; perCat[q.c].correct += 1; }
    }
    const incorrect = total - correct - unsure - skipped;
    // Overall score counts only correct answers: an Unsure (like a skip) is not credit.
    const overall = Math.round((correct / total) * 1000) / 10;
    // Secondary read: accuracy across only the questions the user actually committed to.
    const committed = total - unsure - skipped;
    const committedPct = committed > 0 ? Math.round((correct / committed) * 1000) / 10 : 0;
    const tier = TIERS.find((t) => overall >= t.min) || TIERS[TIERS.length - 1];
    return { correct, incorrect, unsure, skipped, overall, committed, committedPct, perCat, tier };
  }, [answers, questions, catList, total]);

  const startExam = () => {
    setQuestions(withIds(drawExam())); // fresh random draw for this attempt
    setAnswers({}); setCurrent(0); setPhase("exam");
  };
  const restart = () => {
    setAnswers({}); setCurrent(0); setPhase("intro");
    setReviewCat("all"); setIncorrectOnly(false); setConfirmSubmit(false);
  };

  const submit = () => { setPhase("results"); setConfirmSubmit(false); if (scrollRef.current) scrollRef.current.scrollTop = 0; };

  /* ---------------- INTRO ---------------- */
  if (phase === "intro") {
    return (
      <Shell>
        <div className="max-w-3xl mx-auto px-5 py-12 sm:py-16">
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-indigo-300/80 mb-5">
            <span className="h-px w-8 bg-indigo-400/50" /> Proficiency Assessment
          </div>
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-white leading-none">
            Salesforce<br />Proficiency Exam
          </h1>
          <p className="mt-5 text-slate-300 text-lg leading-relaxed max-w-2xl">
            A {total}-question assessment spanning the full platform — from navigation and configuration
            to automation, development, integration, and release management. Each attempt draws a fresh
            random set from a bank of {QUESTIONS.length}, holding the domain and difficulty mix fixed while
            the questions rotate. Your result is scored overall, broken down by domain, and mapped to a tier.
          </p>

          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Stat k={total} label="Questions" />
            <Stat k={catList.length} label="Domains" />
            <Stat k={TIERS.length} label="Tiers" />
            <Stat k="~35m" label="Est. time" />
          </div>

          <div className="mt-10 rounded-xl border border-white/10 bg-white/5 p-5">
            <h2 className="text-sm font-mono uppercase tracking-widest text-slate-400 mb-4">Domains covered — questions per attempt</h2>
            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-2">
              {catList.map((k) => (
                <div key={k} className="flex items-center justify-between text-sm text-slate-300 py-1 border-b border-white/5">
                  <span>{CATEGORIES[k].label}</span>
                  <span className="font-mono text-slate-500 tabular-nums">{catCounts[k]}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 text-sm text-slate-400 space-y-1.5">
            <p>• One question per screen. Navigate with the buttons, the question grid, or arrow keys.</p>
            <p>• Select answers by clicking or with keys <Kbd>1</Kbd>–<Kbd>4</Kbd> / <Kbd>A</Kbd>–<Kbd>D</Kbd>.</p>
            <p>• Unanswered questions count as incorrect. You can submit at any time.</p>
            <p>• Not sure? Choose <span className="text-amber-300">E — Unsure</span> instead of guessing. It never counts as correct, but it's reported separately so a lucky guess doesn't inflate your score.</p>
            <p>• After submitting, review every question and filter by domain or by incorrect answers.</p>
            <p>• Each attempt is a fresh draw — retake it and you'll get a different version.</p>
          </div>

          <button
            onClick={startExam}
            className="mt-10 inline-flex items-center gap-2 rounded-lg bg-indigo-500 hover:bg-indigo-400 px-6 py-3 text-white font-medium tracking-tight transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
          >
            Begin exam
            <span aria-hidden>→</span>
          </button>
        </div>
      </Shell>
    );
  }

  /* ---------------- EXAM ---------------- */
  if (phase === "exam") {
    const q = questions[current];
    const chosen = answers[q.id];
    const progress = Math.round(((current + 1) / total) * 100);
    const answeredPct = Math.round((answeredCount / total) * 100);

    return (
      <Shell>
        <div className="sticky top-0 z-20 border-b border-white/10 bg-slate-900/80 backdrop-blur">
          <div className="max-w-3xl mx-auto px-5 py-3">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span className="uppercase tracking-widest text-indigo-300/80">{CATEGORIES[q.c].short}</span>
              <span className="tabular-nums">{current + 1} / {total} · {answeredCount} answered</span>
            </div>
            <div className="mt-2 h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full bg-indigo-500 transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>

        <div ref={scrollRef} className="max-w-3xl mx-auto px-5 py-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs font-mono uppercase tracking-widest text-slate-500">Q{current + 1}</span>
            <DiffTag d={q.d} />
          </div>
          <h2 className="text-xl sm:text-2xl text-white font-medium tracking-tight leading-snug">{q.q}</h2>

          <div className="mt-6 space-y-2.5">
            {q.o.map((opt, i) => {
              const active = chosen === i;
              return (
                <button
                  key={i}
                  onClick={() => select(q.id, i)}
                  className={
                    "w-full text-left rounded-lg border px-4 py-3.5 flex items-start gap-3 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 " +
                    (active
                      ? "border-indigo-400 bg-indigo-500/20 text-white"
                      : "border-white/10 bg-white/5 text-slate-200 hover:border-white/25 hover:bg-white/10")
                  }
                >
                  <span className={
                    "mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-md text-xs font-mono font-semibold " +
                    (active ? "bg-indigo-400 text-slate-900" : "bg-white/10 text-slate-400")
                  }>
                    {optionLetter(i)}
                  </span>
                  <span className="text-sm leading-relaxed">{opt}</span>
                </button>
              );
            })}

            {/* Explicit opt-out: scored as not-correct, but tracked apart from a guess */}
            <button
              onClick={() => select(q.id, UNSURE)}
              className={
                "w-full text-left rounded-lg border border-dashed px-4 py-3 flex items-start gap-3 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 " +
                (chosen === UNSURE
                  ? "border-amber-400 bg-amber-500/15 text-amber-100"
                  : "border-white/15 bg-transparent text-slate-400 hover:border-amber-400/40 hover:bg-amber-500/5 hover:text-amber-200/90")
              }
            >
              <span className={
                "mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-md text-xs font-mono font-semibold " +
                (chosen === UNSURE ? "bg-amber-400 text-slate-900" : "bg-white/10 text-slate-400")
              }>
                {optionLetter(UNSURE)}
              </span>
              <span className="text-sm leading-relaxed">{UNSURE_LABEL}</span>
            </button>
          </div>

          <div className="mt-8 flex items-center justify-between gap-3">
            <button
              onClick={() => goto(current - 1)}
              disabled={current === 0}
              className="rounded-lg border border-white/10 px-4 py-2.5 text-sm text-slate-200 hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              ← Previous
            </button>

            <button
              onClick={() => setShowPalette((s) => !s)}
              className="rounded-lg border border-white/10 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 transition-colors font-mono"
            >
              {showPalette ? "Hide grid" : "Question grid"}
            </button>

            {current < total - 1 ? (
              <button
                onClick={() => goto(current + 1)}
                className="rounded-lg bg-indigo-500 hover:bg-indigo-400 px-4 py-2.5 text-sm text-white font-medium transition-colors"
              >
                Next →
              </button>
            ) : (
              <button
                onClick={() => setConfirmSubmit(true)}
                className="rounded-lg bg-emerald-500 hover:bg-emerald-400 px-4 py-2.5 text-sm text-slate-900 font-semibold transition-colors"
              >
                Finish
              </button>
            )}
          </div>

          {showPalette && (
            <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono uppercase tracking-widest text-slate-400">Jump to question</span>
                <span className="text-xs font-mono text-slate-500 tabular-nums">{answeredPct}% answered</span>
              </div>
              <div className="grid gap-1.5" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(2rem, 1fr))" }}>
                {questions.map((qq, i) => {
                  const pick = answers[qq.id];
                  const isAnswered = pick !== undefined;
                  const isUnsure = pick === UNSURE;
                  const isCur = i === current;
                  return (
                    <button
                      key={qq.id}
                      onClick={() => { goto(i); }}
                      title={CATEGORIES[qq.c].short + (isUnsure ? " · marked unsure" : "")}
                      className={
                        "h-8 rounded text-xs font-mono tabular-nums transition-colors " +
                        (isCur
                          ? "bg-indigo-400 text-slate-900 font-bold ring-2 ring-indigo-300"
                          : isUnsure
                          ? "bg-amber-500/30 text-amber-100 hover:bg-amber-500/50"
                          : isAnswered
                          ? "bg-indigo-500/30 text-indigo-100 hover:bg-indigo-500/50"
                          : "bg-white/5 text-slate-500 hover:bg-white/10")
                      }
                    >
                      {i + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mt-6 text-center">
            <button
              onClick={() => setConfirmSubmit(true)}
              className="text-sm text-slate-400 hover:text-slate-200 underline underline-offset-4 transition-colors"
            >
              Submit exam now
            </button>
          </div>
        </div>

        {confirmSubmit && (
          <Modal onClose={() => setConfirmSubmit(false)}>
            <h3 className="text-lg font-semibold text-white tracking-tight">Submit for scoring?</h3>
            <p className="mt-2 text-sm text-slate-300">
              You've answered <span className="font-mono text-white">{answeredCount}</span> of{" "}
              <span className="font-mono text-white">{total}</span> questions.
              {answeredCount < total && (
                <> The <span className="font-mono text-amber-300">{total - answeredCount}</span> unanswered will be scored as incorrect.</>
              )}
              {results.unsure > 0 && (
                <> <span className="font-mono text-amber-300">{results.unsure}</span> marked <span className="text-amber-200">Unsure</span> won't count as correct, but they're reported separately so your score isn't inflated by guessing.</>
              )}
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setConfirmSubmit(false)} className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-200 hover:bg-white/5">
                Keep going
              </button>
              <button onClick={submit} className="rounded-lg bg-emerald-500 hover:bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-900">
                Submit &amp; score
              </button>
            </div>
          </Modal>
        )}
      </Shell>
    );
  }

  /* ---------------- RESULTS ---------------- */
  const t = results.tier;
  const ts = TIER_STYLES[t.color];
  const overallSC = scoreColor(results.overall);

  const sortedCats = [...catList].sort((a, b) => {
    const pa = results.perCat[a].total ? results.perCat[a].correct / results.perCat[a].total : 0;
    const pb = results.perCat[b].total ? results.perCat[b].correct / results.perCat[b].total : 0;
    return pb - pa;
  });

  const reviewList = questions.filter((q) => {
    if (reviewCat !== "all" && q.c !== reviewCat) return false;
    if (incorrectOnly && answers[q.id] === q.a) return false;
    return true;
  });

  return (
    <Shell>
      <div ref={scrollRef} className="max-w-4xl mx-auto px-5 py-10">
        {/* Scorecard */}
        <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-indigo-300/80 mb-5">
          <span className="h-px w-8 bg-indigo-400/50" /> Results
        </div>

        <div className="grid md:grid-cols-2 gap-6 items-stretch">
          {/* overall */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 flex flex-col justify-between">
            <div>
              <p className="text-sm font-mono uppercase tracking-widest text-slate-400">Overall score</p>
              <div className="mt-2 flex items-end gap-2">
                <span className={"text-6xl font-semibold tracking-tight tabular-nums " + overallSC.text}>{results.overall}</span>
                <span className="text-2xl text-slate-500 mb-1.5">%</span>
              </div>
              <p className="mt-1 text-sm text-slate-400 tabular-nums">
                {results.correct} correct · {results.incorrect} incorrect
                {results.unsure > 0 && <> · <span className="text-amber-300">{results.unsure} unsure</span></>}
                {results.skipped > 0 && <> · {results.skipped} skipped</>}
                {" "}· {total} total
              </p>
              {results.unsure > 0 && (
                <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                  Excluding the {results.unsure} you marked unsure, you were correct on{" "}
                  <span className="font-mono text-slate-200">{results.committedPct}%</span> of the{" "}
                  <span className="font-mono text-slate-200">{results.committed}</span> you committed to.
                  The score above still counts unsure as not-correct.
                </p>
              )}
            </div>
            <div className="mt-5 h-2 rounded-full bg-white/10 overflow-hidden">
              <div className={"h-full " + overallSC.bar} style={{ width: `${results.overall}%` }} />
            </div>
          </div>

          {/* tier */}
          <div className={"rounded-2xl border p-6 flex flex-col justify-center ring-1 " + ts.badge + " " + ts.ring}>
            <p className="text-xs font-mono uppercase tracking-widest opacity-70">Proficiency tier</p>
            <h2 className="mt-1 text-3xl font-semibold tracking-tight">{t.name}</h2>
            <p className="mt-3 text-sm leading-relaxed opacity-90">{t.blurb}</p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {TIERS.slice().reverse().map((tt) => (
                <span
                  key={tt.name}
                  className={
                    "text-xs font-mono px-2 py-0.5 rounded border " +
                    (tt.name === t.name
                      ? "border-current font-bold"
                      : "border-current opacity-40")
                  }
                >
                  {tt.name}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Category breakdown */}
        <div className="mt-10">
          <h3 className="text-sm font-mono uppercase tracking-widest text-slate-400 mb-4">Breakdown by domain</h3>
          <div className="space-y-2.5">
            {sortedCats.map((k) => {
              const c = results.perCat[k];
              const pct = c.total ? Math.round((c.correct / c.total) * 100) : 0;
              const sc = scoreColor(pct);
              return (
                <button
                  key={k}
                  onClick={() => { setReviewCat(k); setIncorrectOnly(false); document.getElementById("review-anchor")?.scrollIntoView({ behavior: "smooth" }); }}
                  className="w-full text-left group"
                >
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-slate-200 group-hover:text-white transition-colors">
                      {CATEGORIES[k].label}
                      {c.unsure > 0 && (
                        <span className="ml-2 text-xs font-mono text-amber-300/80">{c.unsure} unsure</span>
                      )}
                    </span>
                    <span className={"font-mono tabular-nums " + sc.text}>{c.correct}/{c.total} · {pct}%</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-white/10 overflow-hidden flex">
                    <div className={"h-full transition-all duration-500 " + sc.bar} style={{ width: `${pct}%` }} />
                    <div className="h-full bg-amber-400/30 transition-all duration-500" style={{ width: `${c.total ? (c.unsure / c.total) * 100 : 0}%` }} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Review */}
        <div id="review-anchor" className="mt-12 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
            <h3 className="text-sm font-mono uppercase tracking-widest text-slate-400">Question review</h3>
            <label className="inline-flex items-center gap-2 text-sm text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={incorrectOnly}
                onChange={(e) => setIncorrectOnly(e.target.checked)}
                className="h-4 w-4 rounded border-white/30 bg-transparent accent-rose-500"
              />
              Show missed only (incl. unsure)
            </label>
          </div>

          <div className="flex flex-wrap gap-1.5 mb-6">
            <FilterPill active={reviewCat === "all"} onClick={() => setReviewCat("all")}>
              All domains
            </FilterPill>
            {catList.map((k) => (
              <FilterPill key={k} active={reviewCat === k} onClick={() => setReviewCat(k)}>
                {CATEGORIES[k].short}
              </FilterPill>
            ))}
          </div>

          <p className="text-xs font-mono text-slate-500 mb-4 tabular-nums">
            Showing {reviewList.length} question{reviewList.length === 1 ? "" : "s"}
          </p>

          <div className="space-y-3">
            {reviewList.length === 0 && (
              <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center text-slate-400 text-sm">
                Nothing to show for this filter. {incorrectOnly && "Nothing missed in this domain — nicely done."}
              </div>
            )}
            {reviewList.map((q) => (
              <ReviewCard key={q.id} q={q} chosen={answers[q.id]} />
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-wrap gap-3">
          <button onClick={restart} className="rounded-lg bg-indigo-500 hover:bg-indigo-400 px-5 py-2.5 text-white font-medium transition-colors">
            Retake exam
          </button>
          <button
            onClick={() => { setPhase("exam"); setCurrent(0); }}
            className="rounded-lg border border-white/10 px-5 py-2.5 text-slate-200 hover:bg-white/5 transition-colors"
          >
            Back to my answers
          </button>
        </div>
      </div>
    </Shell>
  );
}

/* ---------------- Sub-components ---------------- */

function Shell({ children }) {
  return (
    <div className="min-h-screen w-full bg-slate-900 text-slate-100 antialiased" style={{ fontFamily: "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" }}>
      {children}
    </div>
  );
}

function Stat({ k, label }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-3">
      <div className="text-2xl font-semibold tracking-tight text-white tabular-nums">{k}</div>
      <div className="text-xs font-mono uppercase tracking-wider text-slate-500 mt-0.5">{label}</div>
    </div>
  );
}

function Kbd({ children }) {
  return <kbd className="inline-block rounded border border-white/20 bg-white/5 px-1.5 py-0.5 text-xs font-mono text-slate-300">{children}</kbd>;
}

function DiffTag({ d }) {
  const map = {
    Foundational: "bg-sky-500/20 text-sky-300 border-sky-500/30",
    Intermediate: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
    Advanced: "bg-violet-500/20 text-violet-300 border-violet-500/30",
  };
  return <span className={"text-xs font-mono uppercase tracking-wider px-2 py-0.5 rounded border " + map[d]}>{d}</span>;
}

function FilterPill({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={
        "text-xs font-mono px-3 py-1.5 rounded-full border transition-colors " +
        (active
          ? "bg-indigo-500 border-indigo-400 text-white"
          : "border-white/10 text-slate-300 hover:bg-white/5")
      }
    >
      {children}
    </button>
  );
}

function Modal({ children, onClose }) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-slate-800 p-6 shadow-2xl">
        {children}
      </div>
    </div>
  );
}

function ReviewCard({ q, chosen }) {
  const [open, setOpen] = useState(false);
  const unanswered = chosen === undefined;
  const isUnsure = chosen === UNSURE;
  const isCorrect = chosen === q.a;

  const statusChip = unanswered
    ? "bg-slate-500/20 text-slate-300 border-slate-400/30"
    : isUnsure
    ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
    : isCorrect
    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
    : "bg-rose-500/20 text-rose-300 border-rose-500/30";
  const statusText = unanswered ? "Skipped" : isUnsure ? "Unsure" : isCorrect ? "Correct" : "Incorrect";

  return (
    <div className={"rounded-xl border bg-white/5 overflow-hidden " + (isCorrect ? "border-emerald-500/20" : isUnsure ? "border-amber-500/25" : unanswered ? "border-white/10" : "border-rose-500/25")}>
      <button onClick={() => setOpen((o) => !o)} className="w-full text-left px-4 py-3.5 flex items-start gap-3 hover:bg-white/5 transition-colors">
        <span className={"mt-0.5 text-xs font-mono uppercase tracking-wider px-2 py-0.5 rounded border flex-none " + statusChip}>{statusText}</span>
        <span className="flex-1 text-sm text-slate-100 leading-snug">{q.q}</span>
        <span className="text-slate-500 flex-none mt-0.5">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="px-4 pb-4 pt-1">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-mono uppercase tracking-wider text-indigo-300/80">{CATEGORIES[q.c].short}</span>
            <span className="text-slate-600">·</span>
            <DiffTag d={q.d} />
          </div>
          <div className="space-y-1.5">
            {q.o.map((opt, i) => {
              const isAns = i === q.a;
              const isChosen = i === chosen;
              let cls = "border-white/10 bg-white/5 text-slate-300";
              if (isAns) cls = "border-emerald-500/40 bg-emerald-500/10 text-emerald-100";
              else if (isChosen && !isAns) cls = "border-rose-500/40 bg-rose-500/10 text-rose-100";
              return (
                <div key={i} className={"rounded-lg border px-3 py-2 flex items-start gap-2.5 text-sm " + cls}>
                  <span className="mt-0.5 font-mono text-xs opacity-70 flex-none">{optionLetter(i)}</span>
                  <span className="flex-1 leading-relaxed">{opt}</span>
                  {isAns && <span className="text-xs font-mono text-emerald-300 flex-none">✓ correct</span>}
                  {isChosen && !isAns && <span className="text-xs font-mono text-rose-300 flex-none">your pick</span>}
                </div>
              );
            })}
            {isUnsure && (
              <div className="rounded-lg border border-dashed border-amber-500/40 bg-amber-500/10 text-amber-100 px-3 py-2 flex items-start gap-2.5 text-sm">
                <span className="mt-0.5 font-mono text-xs opacity-70 flex-none">{optionLetter(UNSURE)}</span>
                <span className="flex-1 leading-relaxed">{UNSURE_LABEL}</span>
                <span className="text-xs font-mono text-amber-300 flex-none">your pick</span>
              </div>
            )}
          </div>
          <div className="mt-3 rounded-lg bg-white/5 border border-white/10 px-3 py-2.5">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-500">Why</span>
            <p className="mt-1 text-sm text-slate-300 leading-relaxed">{q.e}</p>
          </div>
        </div>
      )}
    </div>
  );
}

