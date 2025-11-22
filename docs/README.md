# QuickForms Documentation

This directory contains the VitePress documentation site for QuickForms.

## Development

```bash
# Start dev server
pnpm docs:dev

# Build for production
pnpm docs:build

# Preview production build
pnpm docs:preview
```

## Structure

```
docs/
├── .vitepress/
│   ├── config.ts          # VitePress configuration
│   └── theme/
│       ├── index.ts       # Theme setup
│       └── custom.css     # Custom styles
├── guide/                 # User guides
│   ├── what-is-quickforms.md
│   ├── getting-started.md
│   ├── comparison.md
│   ├── schema-basics.md
│   ├── field-types.md
│   ├── validation.md
│   ├── complex-types.md
│   ├── custom-components.md
│   ├── theming.md
│   ├── custom-validators.md
│   ├── i18n.md
│   └── rbac.md
├── api/                   # API reference
│   ├── form-options.md
│   ├── components.md
│   ├── composables.md
│   ├── schema-extensions.md
│   └── testers-registry.md
├── examples/              # Complete examples
│   ├── basic-form.md
│   ├── nested-objects.md
│   ├── arrays.md
│   ├── conditional-fields.md
│   ├── custom-validation.md
│   └── theming.md
├── packages/              # Package-specific docs
│   ├── core.md
│   ├── vue.md
│   └── quasar.md
├── public/                # Static assets
└── index.md               # Homepage
```

## Adding New Pages

1. Create a markdown file in the appropriate directory
2. Add the page to `.vitepress/config.ts` sidebar configuration
3. Use frontmatter for page metadata if needed

## Deployment

The docs can be deployed to GitHub Pages:

```bash
# Build the docs
pnpm docs:build

# The output will be in docs/.vitepress/dist
# Deploy this directory to your hosting provider
```

### GitHub Pages Setup

1. Build the docs: `pnpm docs:build`
2. Deploy the `docs/.vitepress/dist` directory to the `gh-pages` branch
3. Enable GitHub Pages in repository settings

Or use GitHub Actions for automatic deployment on push.

## Features

- ✅ Beautiful default theme
- ✅ Full-text search
- ✅ Mobile responsive
- ✅ Dark mode support
- ✅ Syntax highlighting
- ✅ Custom purple branding
- ✅ Automatic sidebar navigation
- ✅ Code group tabs

## Contributing

When adding new content:
- Keep examples concise and focused
- Include TypeScript types
- Add links to related pages
- Test code examples before committing
