# Final release-manifest qualification

This check is a fail-closed, protected-environment gate for the immutable release
manifest and its actual evidence files. It does not deploy, promote, or connect to a
database. A local invocation is diagnostic only: even if an operator supplies matching
environment values locally, only a successful run approved by the protected GitHub
`release-qualification` environment has release authority.

The staging workflow continues to run the default manifest command with protected
environment bindings. That command intentionally accepts a `DRAFT` manifest before
sanitized-staging mutation. Only after all evidence and approvals are complete, set the
manifest status to `QUALIFIED`, assemble the evidence bundle described below, approve
the manifest bytes and hashes in the protected environment, and dispatch
`Final release qualification`.

Configure `release-qualification` with required reviewers and no administrator bypass.
Its protected values are:

- secret `QUALIFICATION_APPROVAL_CONTEXT`, exactly
  `RELEASE_QUALIFICATION_APPROVED`;
- secret `APPROVED_QUALIFIED_RELEASE_MANIFEST_YAML_B64`, the base64 encoding of the
  exact approved manifest bytes;
- variables `APPROVED_QUALIFIED_RELEASE_MANIFEST_SHA256` and
  `APPROVED_QUALIFICATION_EVIDENCE_INDEX_SHA256`;
- variables `APPROVED_RELEASE_ID`, `APPROVED_FRONTEND_SHA`, and
  `APPROVED_BACKEND_SHA`.

The selected same-repository Actions artifact must extract to a root containing
`qualification-evidence-index.json` and every referenced evidence file. The JSON index
uses this format:

```json
{
  "schemaVersion": 2,
  "releaseManifestSha256": "<approved-manifest-sha256>",
  "files": [
    {
      "path": "database/exact/EVIDENCE-SEAL",
      "kind": "evidence-seal",
      "manifestPaths": [
        "databaseEvidence.exactCloneEvidenceRootSealSha256"
      ],
      "evidenceManifestPath": "database/exact/EVIDENCE-MANIFEST.sha256"
    }
  ]
}
```

Every non-empty manifest field whose name ends in `Sha256` must occur exactly once in
the index, except `databaseEvidence.sourceSnapshotIdSha256`: that field is the value
digest of `sourceSnapshotId`, is checked directly by the validator, is protected by the
approved manifest bytes, and is repeated inside both immutable clone seals. A single
file may bind multiple manifest paths only when its bytes really
produce the hash recorded at every one of those paths. Absolute paths, traversal,
symlinks, missing files, extra/unbound paths, manifest-byte changes, and index-byte
changes all fail qualification. The evidence root itself must be a real directory, and
its actual regular-file set must equal the canonical index exactly. Every seal's stage,
release, source hash, artifact count, manifest hash, and contained checksums are parsed;
seal manifests and support files are explicitly indexed with empty `manifestPaths`.
Duplicate JSON keys are refused in the index and every JSON evidence file.

`kind` is mandatory and derived from the bound manifest path. Typed validators require
real JUnit testcase counts, typed Trivy results, a nonempty SPDX document, all four
RC/legacy HTTP contracts, provider-native restore receipts, strict origin aggregate
rows, and the release/source/seal-bound sanitized before/after comparison. A checksum-
matching generic pass file is not qualification evidence.

Do not qualify the template itself. Copy it to the restricted evidence location, fill it
with the actual immutable hashes, run URLs, counts, timestamps, approvals, and gate
decisions, and seal that exact file. The workflow exits non-zero on the first missing,
placeholder, null, inconsistent, unapproved, checksum-mismatched, or unsafe GO field.

The qualification mode requires schema version 5 and checks:

- the same frontend SHA, backend SHA, and candidate artifact set across exactly three
  ordered successful runs;
- all frontend/backend CI outcomes, executed test counts, and zero high/critical
  dependency or image findings;
- production read-only audit, exact-clone migration/compatibility, sanitized-clone
  before/after seals, Flyway/Hibernate validation, and an approved restore within four
  hours;
- two distinct same-provider restore receipts whose source/release/target and UTC
  start/completion are plausible, precede their clone seals, and bind byte-identical
  pre-mask non-sensitive origin fingerprints;
- one source snapshot across both clones, zero unknown/missing latest public-schema
  entries, and zero production read-only SECURITY DEFINER/predefined-role/TEMP/RLS
  violations;
- fail-closed payment, Instagram, upload, scheduling, and email runtime state, including
  both live evidence-seal fingerprints;
- a passing, immutable JUnit result proving the actually deployed creator signup
  payload's five legal document versions reached backend token validation without
  a legal-version mismatch;
- JUnit suite result counts at least as large as the declared frontend/backend/integration
  counts, with one actual testcase per declared test and explicit zero failures, errors,
  and skips; structured Trivy/SPDX evidence cannot be replaced by a generic dummy;
- 24 hours of 100% synthetic success, zero unhandled Sentry errors, 50 VUs, 20 RPS,
  p95 at or below one second, and an error rate below 0.5%;
- repository controls, legal values, email evidence, ADMIN bootstrap shutdown, all role
  approvals, and the immutable rollback runbook approval;
- zero P0 entries and complete owner, due date, acceptance text, accepter, and acceptance
  time for every P1 entry.

An unfinished provider gate is allowed only when its public feature remains disabled and
the manifest records `status: DISABLED` plus a concrete reason. A completed provider gate
must use `status: APPROVED` and include all provider evidence. Passing the protected
workflow creates only an immutable qualification receipt. It does not make a local run
authoritative and does not deploy anything. Production deployment still requires the
separate authorization described in the backend release-candidate runbook.
