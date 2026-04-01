# Plan: Fix Release Workflow Version Conflicts

## Context

Multiple release workflows in this repository are triggering on every push to `main`, regardless of which project actually changed. This causes:

1. **Unnecessary workflow runs** - All 3 release workflows run even when only 1 project changed
2. **Race conditions** - When workflows run in parallel, they fight over version bumps and tags
3. **Failed releases** - Semantic-release fails when another workflow already created the version tag

Each release workflow uses `cycjimmy/semantic-release-action` which reads the version from `package.json`/`setup.py` and creates git tags. Running multiple instances simultaneously causes conflicts.

## Changes

### 1. Add Path Filtering to All Release Workflows

Each workflow should only trigger when files in its corresponding example directory change:

| Workflow | Path Filter |
|----------|-------------|
| `example-python-app-release.yml` | `examples/python-app/**` |
| `example-nodejs-app-release.yml` | `examples/nodejs-app/**` |
| `example-nodejs-package-release.yml` | `examples/nodejs-package/**` |

### 2. Use Shared Concurrency Group

Replace individual concurrency groups with a shared group to prevent any parallel release runs:

```yaml
concurrency:
  group: release-all
  cancel-in-progress: false
```

This ensures releases are serialized across the entire repository.

### 3. Add CI Workflow Path Filtering (Optional Enhancement)

CI workflows should also get path filtering to avoid running validation when unrelated projects change.

## Files Modified

| File | Change |
|------|--------|
| `.github/workflows/example-python-app-release.yml` | Add `paths` filter + shared concurrency group |
| `.github/workflows/example-nodejs-app-release.yml` | Add `paths` filter + shared concurrency group |
| `.github/workflows/example-nodejs-package-release.yml` | Add `paths` filter + shared concurrency group |
| `.github/workflows/example-python-app-ci.yml` | Add `paths` filter |
| `.github/workflows/example-nodejs-app-ci.yml` | Add `paths` filter |
| `.github/workflows/example-nodejs-package-ci.yml` | Add `paths` filter |

## Verification

1. Push a change to `examples/python-app/` only → only `python-app` release and CI should trigger
2. Push a change to `examples/nodejs-app/` only → only `nodejs-app` release and CI should trigger
3. Verify workflows don't fail due to version conflicts

## Alternative Solutions Considered

1. **Dispatcher workflow** - Single workflow that detects changes and triggers only relevant workflows. More complex but more flexible for complex monorepos.

2. **Separate version files** - Each project manages its own version in separate files (e.g., `examples/python-app/version`). Eliminates conflicts but requires more setup per project.

3. **Conditional job execution** - Use `if` conditions based on `github.event.commits.files`. More complex and harder to debug.

Path filtering with shared concurrency is the simplest, most maintainable solution for template repositories.
