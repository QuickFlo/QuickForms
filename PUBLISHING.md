# Publishing QuickForms to NPM

## Prerequisites

1. **NPM Account**: Create an account at [npmjs.com](https://www.npmjs.com/)
2. **NPM Login**: Log in to npm locally
   ```bash
   npm login
   ```
3. **Organization Access** (Optional): If using `@quickflo` scope, you need access to the `quickflo` organization on npm

## One-Time Setup

### 1. Create NPM Organization (if using scoped packages)

```bash
# Create organization on npmjs.com or use your username as scope
# For @quickflo scope, create "quickflo" organization
```

### 2. Update package.json Files

Ensure all packages have correct:
- `author`: Your name/email
- `repository`: GitHub repo URL
- `homepage`: Project homepage
- `bugs`: Issue tracker URL

## Publishing Steps

### Option A: Manual Publishing (Recommended for first publish)

```bash
# From project root

# 1. Clean and build everything
pnpm install
pnpm run build

# 2. Check build outputs
ls packages/core/dist
ls packages/vue/dist

# 3. Test builds locally (optional but recommended)
cd packages/core
npm pack  # Creates a .tgz file
cd ../vue
npm pack

# 4. Publish core package first (vue depends on it)
cd packages/core
npm publish --access public

# 5. Publish vue package
cd ../vue
npm publish --access public
```

### Option B: Using Changesets (Recommended for ongoing releases)

We'll set up changesets for better version management:

```bash
# Install changesets
pnpm add -D -w @changesets/cli

# Initialize changesets
pnpm changeset init

# Create a changeset (describes your changes)
pnpm changeset

# Version packages (bumps versions based on changesets)
pnpm changeset version

# Publish to npm
pnpm changeset publish
```

## Version Bumping

Follow semantic versioning:
- **0.1.0 → 0.1.1**: Patch (bug fixes)
- **0.1.0 → 0.2.0**: Minor (new features, backwards compatible)
- **0.1.0 → 1.0.0**: Major (breaking changes)

```bash
# Bump version manually (from package directory)
npm version patch  # 0.1.0 -> 0.1.1
npm version minor  # 0.1.0 -> 0.2.0
npm version major  # 0.1.0 -> 1.0.0
```

## Verify Published Packages

After publishing:

```bash
# Check if packages are live
npm view @quickflo/core
npm view @quickflo/vue

# Test installation in a new project
mkdir test-quickflo
cd test-quickflo
npm init -y
npm install @quickflo/core @quickflo/vue
```

## Troubleshooting

### "Package name taken"

If `@quickflo` is taken, you can:
1. Use your npm username as scope: `@yourusername/quickflo-core`
2. Use unscoped names: `quickflo-core`, `quickflo-vue`
3. Request access to existing organization

### "You do not have permission to publish"

```bash
# Make sure you're logged in
npm whoami

# Check package is set to public
npm publish --access public
```

### "ENOENT: dist folder not found"

Make sure you built the packages first:
```bash
pnpm run build
```

## Quick Publish Checklist

- [ ] Updated version numbers in package.json
- [ ] Updated CHANGELOG.md (or created changeset)
- [ ] Committed all changes to git
- [ ] Built all packages (`pnpm run build`)
- [ ] Tested builds locally
- [ ] Published core first, then vue
- [ ] Created git tag: `git tag v0.1.0 && git push --tags`
- [ ] Verified on npmjs.com

## First Publish Commands (Quick Reference)

```bash
# Login to npm
npm login

# Build everything
pnpm install
pnpm run build

# Publish (from project root)
cd packages/core && npm publish --access public
cd ../vue && npm publish --access public

# Tag in git
git tag v0.1.0
git push origin v0.1.0
```

## After Publishing

1. Update README with installation instructions
2. Create GitHub release with changelog
3. Share on Twitter/social media
4. Submit to [awesome-vue](https://github.com/vuejs/awesome-vue)
