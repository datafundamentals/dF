# Improvements to App Starter Template (Based on First Real Usage)

## Purpose
This document captures observations from the first production clone of `apps/df-app-starter-template` during development of `apps/df-user-admin-app`. The goal is to identify gaps, friction points, and automation opportunities to improve the starter for future apps.

## Observations by first usage 1117

*This section will be populated by the coding agent during ticket 1117_DF_USER_ADMIN_APP*

### Instructions for Agent
As you work through cloning and configuring the User Admin App, document:

1. **Missing Configurations**
   - What files needed manual updates that could have been pre-configured?
   - What default values were wrong or needed adjustment?

2. **Unclear Patterns**
   - What documentation was missing or unclear?
   - What decisions required guesswork that should have been specified?

3. **Manual Steps**
   - What repetitive tasks could be scripted?
   - What find-and-replace operations were needed?

4. **Naming Conventions**
   - What naming patterns would enable automation?
   - Example: "If all apps used `df-[feature]-app`, we could script import updates"

5. **Import Path Issues**
   - What imports broke after cloning?
   - What paths needed manual correction?

6. **Testing Configuration**
   - What test setup was missing?
   - How could Playwright config be more template-friendly?

7. **Build/Dev Scripts**
   - What package.json scripts needed updates?
   - What npm/pnpm commands were unclear?

8. **Positive Observations**
   - What worked well in the starter?
   - What patterns made cloning easier?

### Format
Use this structure for each observation:

```markdown
### [Category] - [Brief Description]

**Issue**: What was the problem or friction point?

**Current State**: How does the starter handle this now?

**Proposed Fix**: Specific change to make to the starter template

**Automation Potential**: Could this be scripted? How?

**Priority**: High / Medium / Low

**Example**: If applicable, show before/after or code example
```

## Implementation Plan
*After ticket 1117 completes, review observations and create follow-up tickets to update the starter template*

## Success Criteria
- [ ] Agent documented at least 5 observations during development
- [ ] Each observation includes proposed fix
- [ ] Observations prioritized by impact
- [ ] At least one automation opportunity identified
