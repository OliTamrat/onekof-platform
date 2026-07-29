const { P, B, BOLDLEAD, STEP, H1, H2, table, buildGuide } = require('./lib/guide-lib');

buildGuide({
  subtitle: 'Activity & Audit Trail',
  headerTitle: 'Activity & Audit Trail',
  version: '1.0',
  date: 'July 29, 2026',
  outFile: 'ONEKOF_SUPPORT_GUIDE_ACTIVITY_AUDIT_TRAIL.docx',
  body: [
    // ---- 1. Overview ----
    H1('1. What is the Activity Trail?'),
    P('Every time somebody changes an issue in Onekof, the platform writes down what changed, who changed it, and when. That record is the Activity Trail. It appears in three places: inside an issue (the Activity section of the issue panel), on the Dashboard as Recent Activity, and on the Issues Summary page as a full timeline.'),
    P('The purpose is accountability without supervision. A project administrator should be able to answer "what has been done on this task, and by whom?" by reading, rather than by asking the person who did it. For a government institution or an NGO reporting to a funder, that record is often the deliverable — not a convenience.'),
    P('The trail is written automatically. There is nothing for a user to switch on, and nothing a user can edit or delete.'),

    // ---- 2. Roles ----
    H1('2. Who Can Do What'),
    P('Activity follows the visibility of the thing it describes. If a user cannot see an issue, they cannot see its history.'),
    table([
      ['Action', 'Required role'],
      ['See activity on an issue', 'Anyone who can see the issue itself'],
      ['See organization-wide activity (Dashboard, Summary)', 'Any organization member — scoped to projects they can access'],
      ['See activity on a PRIVATE or CONFIDENTIAL project', 'Explicit project membership (org Admins are NOT automatically included on CONFIDENTIAL)'],
      ['See activity on a care item (Medical module)', 'LIMITED patient access or above — project access alone is not enough'],
      ['Edit or delete an activity record', 'Nobody. There is no such function, by design.'],
    ]),
    P('A GUEST sees activity only for projects they have been explicitly added to. This is the same rule the issue list uses, applied to the same data.'),

    // ---- 3. Key terms ----
    H1('3. Key Terms'),
    BOLDLEAD('Activity — ', 'one recorded change: an actor, an action, a target, a timestamp, and the detail of what changed.'),
    BOLDLEAD('Actor — ', 'the user who made the change. Always the signed-in account, never inferred.'),
    BOLDLEAD('Action — ', 'the kind of change: updated, commented, assigned, sprint changed, classification changed.'),
    BOLDLEAD('Change detail — ', 'the before-and-after shown under the actor line, for example "status  todo → in progress".'),
    BOLDLEAD('Watcher — ', 'somebody subscribed to notifications about an issue. Watching is separate from activity: watchers receive alerts, the trail records history. A person can appear in the trail without watching, and watch without ever appearing.'),
    BOLDLEAD('Care item — ', 'an issue linked to a patient record (Medical module). Care items follow an additional visibility rule; see section 5.'),

    // ---- 4. Step-by-step ----
    H1('4. Step-by-Step Guides'),

    H2('4.1  See what changed on one issue'),
    STEP('steps', 'Open the issue from the board, list or backlog.'),
    STEP('steps', 'Scroll the issue panel to the Activity section.'),
    STEP('steps', 'Each row shows who acted, what they did, when, and the detail of the change.'),
    P('Rows are newest first. The section shows the ten most recent entries; the Issues Summary page shows the full history.'),

    H2('4.2  See what a member has been doing across the organization'),
    STEP('steps', 'Go to Issues → Summary.'),
    STEP('steps', 'Scroll to the Activity Timeline.'),
    STEP('steps', 'Use the filter tabs to narrow to a single entity type, or the pagination controls to move back through time.'),
    STEP('steps', 'Click any row to open the issue it refers to.'),

    H2('4.3  Read a comment from the trail'),
    P('Comment activity shows the first 100 characters of the comment beneath the actor line, in quotation marks. Longer comments end with an ellipsis; open the issue and read the Comments section for the full text.'),

    // ---- 5. Rules ----
    H1('5. Rules the System Enforces (and Why)'),

    BOLDLEAD('Activity cannot be edited or deleted. ', 'There is no interface for it and no API for it. A record that can be revised by the person it describes is not a record. This is the property that makes the trail usable as evidence in an audit or a funder review.'),

    BOLDLEAD('The trail follows issue visibility, not organization role. ', 'An organization Admin does not automatically see activity on a CONFIDENTIAL project they were never added to. Administering the workspace and being entitled to read a particular project\'s history are different things.'),

    BOLDLEAD('Care items are omitted, not redacted, below LIMITED. ', 'For a user without patient access, activity on a care item does not appear at all. It is not shown greyed out or marked hidden. A redacted row still says "a patient exists and somebody is working on them", which on a small ward is often enough to identify who.'),

    BOLDLEAD('Long text records that it changed, not what it became. ', 'Editing a description produces "description edited" rather than the new text. Descriptions run to thousands of characters, and copying arbitrary user text into a feed that appears on other screens is a different decision from noting that an edit happened. Open the issue to read the current description.'),

    BOLDLEAD('An unchanged field produces nothing. ', 'Saving an issue without altering a field records no activity for it. A trail full of non-changes becomes unreadable faster than a sparse one does.'),

    BOLDLEAD('Inside an issue, activity rows do not link anywhere. ', 'They describe the issue already open. Elsewhere — Dashboard, Summary — rows link to the issue they describe.'),

    // ---- 6. Troubleshooting ----
    H1('6. Troubleshooting & FAQ'),
    table([
      ['Symptom', 'Answer'],
      ['"A member edited the task but the trail shows nothing"', 'Check the date. Changes to title, description, due date, estimate, time spent, story points, type and labels were only recorded from 29 July 2026 onwards. Edits before that date were never written and cannot be recovered.'],
      ['"It says somebody commented but I cannot see the comment"', 'Comment text displays beneath the actor line. If it is missing, the browser is running a cached older version — reload the page.'],
      ['"I can see the issue but not its activity"', 'For a care item, seeing the issue and being entitled to its history are separate permissions. Check the member\'s patient access level.'],
      ['"An Admin says they cannot see a project\'s activity"', 'Expected on a CONFIDENTIAL project. Org Admins are not implicitly members. Add them to the project explicitly.'],
      ['"Two watchers have the same name"', 'Two separate user accounts with the same display name and different email addresses. This is legitimate and not a fault. Watchers are unique per user per issue — the same account cannot appear twice.'],
      ['"Clicking an activity row inside an issue does nothing"', 'Correct. It would open the issue already on screen. Rows link only from the Dashboard and Summary views.'],
      ['"The trail shows an assignment but not who to"', 'Assignment records that it happened; the current assignee is shown in the issue panel. Historical assignees are not displayed in the trail.'],
    ]),

    // ---- 7. Benefits ----
    H1('7. Benefits'),
    BOLDLEAD('For teams — ', 'no reconstructing who changed what from memory or chat history. The issue carries its own record.'),
    BOLDLEAD('For managers — ', 'a factual answer to "has this moved, and who moved it?" without asking, and without the answer depending on someone\'s recollection.'),
    BOLDLEAD('For leadership and funders — ', 'an unalterable record of who did what and when, per project. For institutions reporting to a ministry or a donor, this is frequently the artefact being asked for.'),
    BOLDLEAD('For compliance — ', 'patient-related work follows the same trail with an additional access rule, so a healthcare institution gets accountability and confidentiality from one mechanism rather than two.'),

    // ---- 8. Under the hood ----
    H1('8. Under the Hood'),
    P('For senior support and engineers.'),
    BOLDLEAD('Storage — ', 'each entry is a UserActivity row: actor, organization, entity type and id, action, and a metadata object holding the change detail. Rows are append-only; no code path updates or deletes them.'),
    BOLDLEAD('Recorded fields — ', 'the issue update route compares the stored value against the incoming one for title, description, type, due date, estimate, time spent, story points, labels, status, priority, assignee, sprint, and department/workstream. Values are normalised before comparison (dates to ISO, arrays joined) so a field that did not change emits nothing.'),
    BOLDLEAD('Comments — ', 'recorded with the comment id and the first 100 characters. The excerpt is stored at write time, so it reflects the comment as posted.'),
    BOLDLEAD('Care-item filtering — ', 'applied in the database query, not to the returned list. Filtering afterwards would leave paginated totals counting rows the caller never receives, which discloses how many exist.'),
    BOLDLEAD('Known limitation — ', 'aiSummary and impactScore are present in the schema and always empty. Two activity loggers exist; the one the issue routes use does not populate them. The trail is complete without them.'),
    BOLDLEAD('Retention — ', 'activity rows are not currently pruned. Patient records follow the separate 12-month retention rule (Medical module), and erasing a patient leaves the work history intact and anonymous.'),

    // ---- 9. Navigation ----
    H1('9. Where Everything Lives'),
    table([
      ['I want to…', 'Go to…'],
      ['See history for one issue', 'Open the issue → Activity section'],
      ['See everything happening in the organization', 'Dashboard → Recent Activity'],
      ['See the full filterable timeline', 'Issues → Summary → Activity Timeline'],
      ['Read a comment in full', 'Open the issue → Comments'],
      ['See or change who is notified', 'Open the issue → Watchers'],
      ['Check why somebody cannot see activity', 'Project settings → Members, and Organization Settings → Members for patient access'],
    ]),
  ],
});
