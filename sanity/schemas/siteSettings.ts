import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  __experimental_actions: ['update', 'publish'],
  fields: [
    defineField({
      name: 'heroHeadline',
      title: 'Hero Headline',
      type: 'string',
      description: 'Main hero headline (e.g. "Building ROI-First AI Solutions")',
    }),
    defineField({
      name: 'heroSubheadline',
      title: 'Hero Sub-headline',
      type: 'text',
      rows: 3,
      description: 'Supporting text below the hero headline',
    }),
    defineField({
      name: 'aboutNarrative',
      title: 'About Narrative',
      type: 'array',
      of: [{ type: 'block' }],
      description: 'Rich-text bio for the About / AI Dad section',
    }),
    defineField({
      name: 'substackUrl',
      title: 'Substack URL',
      type: 'url',
      description: 'Your Substack publication URL for the RSS feed proxy',
    }),
    defineField({
      name: 'calendarBookingUrl',
      title: 'Calendar Booking URL',
      type: 'url',
      description: 'Google Calendar booking link shown in the Contact section',
    }),
    defineField({
      name: 'githubUrl',
      title: 'GitHub URL',
      type: 'url',
    }),
    defineField({
      name: 'linkedinUrl',
      title: 'LinkedIn URL',
      type: 'url',
    }),
  ],
  preview: {
    select: {
      title: 'heroHeadline',
    },
    prepare({ title }) {
      return { title: title || 'Site Settings' };
    },
  },
});
