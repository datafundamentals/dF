#!/usr/bin/env node
import {readFileSync, existsSync} from 'node:fs';
import {resolve, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '../../../');

const CHECKS = [
  {
    path: 'packages/ui-lit/README.md',
    requiredSnippets: ['Critical: Material Design 3 Requirement', '<md-filled-button>', '<md-outlined-text-field>'],
  },
  {
    path: 'packages/ui-lit/templates/md3-component-template.ts',
    requiredSnippets: ['⚠️ CRITICAL STANDARDS COMPLIANCE ⚠️', '@material/web/button/filled-button.js'],
  },
  {
    path: 'guides/CREATING_COMPLIANT_UI_COMPONENTS.md',
    requiredSnippets: ['Start With the Template', 'Material Web Components — When Available'],
  },
  {
    path: 'guides/STANDARDS_EXEMPTION_PROCESS.md',
    requiredSnippets: ['When an Exemption Is Allowed', 'eslint-disable-next-line @df/md3/enforce-md3'],
  },
  {
    path: 'guides/STANDARDS_COMPLIANCE_TROUBLESHOOTING.md',
    requiredSnippets: ['Common Fixes', 'If the Replacement Is Non-trivial'],
  },
  {
    path: 'guides/ADDING_STANDARDS_RULES.md',
    requiredSnippets: ['Define the Rule', 'Update Tooling'],
  },
  {
    path: 'guides/TICKET_COMPLETION_CHECKLIST.md',
    requiredSnippets: ['Ticket Completion Verification', 'All UI uses MD3 components'],
  },
  {
    path: 'guides/AGENT_WORKFLOW_PATTERNS.md',
    requiredSnippets: ['Two-Phase Prompting', 'Phase 3 – Remediate'],
  },
  {
    path: 'guides/MULTI_AGENT_REVIEW.md',
    requiredSnippets: ['Multi-Agent Review Protocol', 'Agent C – Standards Auditor'],
  },
];

const failures = [];

for (const check of CHECKS) {
  const absolutePath = resolve(PROJECT_ROOT, check.path);
  if (!existsSync(absolutePath)) {
    failures.push({path: check.path, reason: 'File missing'});
    continue;
  }

  const content = readFileSync(absolutePath, 'utf8');
  const missing = check.requiredSnippets.filter((snippet) => !content.includes(snippet));
  if (missing.length) {
    failures.push({
      path: check.path,
      reason: `Missing required sections: ${missing.join(', ')}`,
    });
  }
}

if (failures.length) {
  console.error('❌ Standards documentation check failed.');
  failures.forEach((failure) => {
    console.error(`- ${failure.path}: ${failure.reason}`);
  });
  process.exit(1);
}

console.log('✅ Standards documentation check passed.');
