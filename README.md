# ci-workflow-templates

Template GitHub Actions workflows for Gisat organization projects. This repository provides reusable CI/CD workflow templates and a manifest for AI-agent-driven workflow selection.

## Repository Structure

```
ci-workflow-templates/
├── .github/
│   └── workflows/                       # Example workflows (run against examples/)
├── examples/                            # Example projects
│   ├── nodejs-app/                      # Node.js application with Docker
│   ├── python-app/                      # Python application with Docker
│   └── nodejs-package/                  # Node.js package (npm)
├── workflow-manifest.json               # AI-agent selection manifest
├── STRUCTURE.md                        # Detailed architecture documentation
├── RELEASE-MECHANISMS.md               # Release workflow patterns
├── SEMANTIC-RELEASE-REPOS.md           # Semantic-release configuration
└── README.md                           # This file
```

## Workflow Types

### CI Workflows

Run on pull request and push to `main`. Validate code quality, run tests, and build artifacts.

| Workflow | Purpose |
|----------|---------|
| `example-nodejs-app-ci.yml` | Node.js app: lint, test, build, Docker build |
| `example-python-app-ci.yml` | Python app: lint, type check, test, Docker build |
| `example-nodejs-package-ci.yml` | npm package: lint, test, build |

### Release Workflows

Run on push to `main`. Publish artifacts using semantic-release.

| Workflow | Purpose |
|----------|---------|
| `example-nodejs-app-release.yml` | Semantic-release + Docker image to GHCR |
| `example-python-app-release.yml` | Semantic-release + Docker image to GHCR |
| `example-nodejs-package-release.yml` | Semantic-release + npm package |

## Examples

The `examples/` directory contains functional projects:

### nodejs-app
Node.js application that publishes a Docker image to GHCR.
```
examples/nodejs-app/
├── Dockerfile
├── index.js
└── package.json
```

### python-app
Python application that publishes a Docker image to GHCR.
```
examples/python-app/
├── Dockerfile
├── app.py
└── pyproject.toml
```

### nodejs-package
Node.js library published to npm registry.
```
examples/nodejs-package/
├── package.json
└── src/index.js
```

## Prerequisites

### DEPLOY_KEY Secret

The `DEPLOY_KEY` is an SSH key used for git operations in release workflows. It's required because `GITHUB_TOKEN` lacks sufficient permissions to push tags and commits during semantic-release.

#### Why DEPLOY_KEY Instead of GITHUB_TOKEN?

- `GITHUB_TOKEN` cannot push to the repository that triggered the workflow
- `GITHUB_TOKEN` permissions are restricted to prevent recursive workflow triggers
- Deploy keys grant explicit read/write access to a single repository

#### Creating a Deploy Key

**Step 1: Generate a new SSH key**

```bash
# Generate ED25519 key (recommended)
ssh-keygen -t ed25519 -C "github-actions-deploy@example.com" -f deploy_key

# Or RSA key (if required)
ssh-keygen -t rsa -b 4096 -C "github-actions-deploy@example.com" -f deploy_key
```

**Step 2: Add the public key to GitHub repository**

1. Open your repository on GitHub
2. Go to **Settings** → **Deploy keys** (or **SSH and GPG keys** → **New deploy key**)
3. Click **Add deploy key**
4. Title: `github-actions-deploy` (or similar)
5. Paste the **public key** content (`deploy_key.pub`)
6. ✅ Check "Allow write access"
7. Click **Add key**

**Step 3: Add the private key as a GitHub Secret**

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Name: `DEPLOY_KEY`
4. Paste the **private key** content (`deploy_key`)
5. Click **Add secret**

#### Verify the Deploy Key

```bash
# Test the connection (replace with your repo)
ssh -i deploy_key -T git@github.com:YOUR_ORG/YOUR_REPO.git
```

Expected output: `Hi YOUR_ORG/YOUR_REPO! You've successfully authenticated.`

#### Security Best Practices

1. **Use a dedicated key** - Never reuse personal SSH keys
2. **Use ED25519** - Modern, shorter keys with better security
3. **Limit permissions** - Only add to repositories that need it
4. **Rotate periodically** - Regenerate keys every 90 days
5. **Protect the private key** - Never commit it to version control

### Secrets Required

| Secret | Purpose |
|--------|---------|
| `DEPLOY_KEY` | SSH key for git operations (push tags, commits) |

### Repository Settings

1. **Default branch**: `main`
2. **Workflow permissions**: Settings → Actions → Workflow permissions:
   - ✅ "Read and write permissions"
   - ✅ "Allow GitHub Actions to create and approve pull requests"

## Running Workflows

### CI Workflows

CI workflows run on:
- Pull request to `main`
- Push to `main`

They validate code, run tests, and build artifacts:

```bash
# Triggered automatically on push/PR, no manual steps needed
```

### Release Workflows

Release workflows run on push to `main`:
- Analyzes commits using conventional commits
- Generates changelog
- Creates GitHub release
- Publishes artifacts (Docker image or npm package)

```bash
# Make a commit with conventional format
git commit -m "feat: add new feature"

# Push to main - release workflow triggers automatically
git push origin main
```

## Publishing Destinations

### Docker Publishing (GHCR)

Images are published to GitHub Container Registry (`ghcr.io`).

**Image naming:**
```
ghcr.io/{org}/{repository-name}/{example-name}:{version}
ghcr.io/{org}/{repository-name}/{example-name}:latest
```

**Viewing published packages:**
1. Go to repository → **Packages**
2. Select the package
3. View versions, download stats, and provenance

### npm Publishing (Trusted Publisher)

No secrets required. Uses OpenID Connect (OIDC) for secure, short-lived authentication.

#### Setting Up Trusted Publisher

**Step 1: Create or configure your npm package**

1. Log in to [npmjs.com](https://www.npmjs.com)
2. Go to your package → **Settings**

**Step 2: Add a trusted publisher**

1. In package settings, find **Publish** → **Trusted Publishing**
2. Click **Add a publisher**
3. Configure:
   - **Registry**: npmjs.com
   - **Repository**: `https://github.com/YOUR_ORG/YOUR_REPO`
   - **Branch**: `main` (or your release branch)
   - **Workflow**: Select your release workflow file

**Step 3: Update package.json**

```json
{
  "name": "@gisat/your-package",
  "publishConfig": {
    "registry": "https://registry.npmjs.org",
    "access": "public"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/YOUR_ORG/YOUR_REPO.git"
  }
}
```

## Action Versions

All workflows use latest stable versions:

| Action | Version |
|--------|---------|
| `actions/checkout` | v6 |
| `actions/setup-node` | v6 |
| `actions/setup-python` | v5 |
| `docker/setup-buildx-action` | v4 |
| `docker/login-action` | v4 |
| `docker/build-push-action` | v6 |
| `docker/metadata-action` | v6 |
| `cycjimmy/semantic-release-action` | v6 |
| `astral-sh/setup-uv` | v5 |
