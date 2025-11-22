import { defineConfig } from "vitepress";

export default defineConfig({
  title: "QuickForms",
  description:
    "Vue 3 JSON Schema form generator with reasonable escape hatches",
  base: "/QuickForms/",

  ignoreDeadLinks: true,

  themeConfig: {
    logo: "/logo.svg",

    nav: [{ text: "Guide", link: "/guide/getting-started" }],

    sidebar: {
      "/guide/": [
        {
          text: "Introduction",
          items: [
            { text: "What is QuickForms?", link: "/guide/what-is-quickforms" },
            { text: "Getting Started", link: "/guide/getting-started" },
            { text: "Comparison", link: "/guide/comparison" },
          ],
        },
        {
          text: "Essentials",
          items: [
            { text: "Schema Basics", link: "/guide/schema-basics" },
            { text: "Field Types", link: "/guide/field-types" },
            { text: "Validation", link: "/guide/validation" },
            { text: "Complex Types", link: "/guide/complex-types" },
          ],
        },
        {
          text: "Packages",
          items: [
            { text: "Vue", link: "/guide/vue" },
            { text: "Quasar", link: "/guide/quasar" },
          ],
        },
        {
          text: "Advanced",
          items: [
            { text: "Custom Components", link: "/guide/custom-components" },
            { text: "Theming", link: "/guide/theming" },
            { text: "Custom Validators", link: "/guide/custom-validators" },
            { text: "Internationalization", link: "/guide/i18n" },
            { text: "Role-Based Access", link: "/guide/rbac" },
          ],
        },
        {
          text: "API Reference",
          items: [
            { text: "Form Options", link: "/guide/form-options" },
            { text: "Schema Extensions", link: "/guide/schema-extensions" },
            { text: "Components", link: "/guide/components" },
            { text: "Composables", link: "/guide/composables" },
            { text: "Testers & Registry", link: "/guide/testers-registry" },
          ],
        },
        {
          text: "Examples",
          items: [
            { text: "Basic Form", link: "/guide/examples/basic-form" },
            { text: "Nested Objects", link: "/guide/examples/nested-objects" },
            { text: "Arrays", link: "/guide/examples/arrays" },
            {
              text: "Conditional Fields",
              link: "/guide/examples/conditional-fields",
            },
            {
              text: "Custom Validation",
              link: "/guide/examples/custom-validation",
            },
            { text: "Theming", link: "/guide/examples/theming" },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: "github", link: "https://github.com/quickflo/quickforms" },
    ],

    search: {
      provider: "local",
    },

    footer: {
      message: "Released under the MIT License.",
      copyright: "Copyright © 2024-present QuickForms",
    },
  },
});
