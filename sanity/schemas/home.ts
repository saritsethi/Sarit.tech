import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'home',
  title: 'Home Page',
  type: 'document',
  __experimental_actions: ['update', 'publish'],
  fields: [
    defineField({
      name: 'heroHeadline',
      title: 'Hero Headline',
      type: 'string',
      description: 'e.g. "Building ROI-First AI Solutions"',
    }),
    defineField({
      name: 'heroSubtext',
      title: 'Hero Subtext',
      type: 'text',
      rows: 3,
      description: 'Supporting paragraph below the headline',
    }),
    defineField({
      name: 'heroImage',
      title: 'Hero Image',
      type: 'image',
      options: { hotspot: true },
      description: 'Background or portrait image for the hero section',
    }),
    defineField({
      name: 'primaryCTA',
      title: 'Primary CTA Label',
      type: 'string',
      description: 'e.g. "Book a Strategy Call"',
    }),
  ],
  preview: {
    select: { title: 'heroHeadline' },
    prepare({ title }: { title?: string }) {
      return { title: title || 'Home Page' };
    },
  },
});
