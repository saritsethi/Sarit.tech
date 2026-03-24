import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  __experimental_actions: ['update', 'publish'],
  fields: [
    // ---- Hero section ----
    defineField({
      name: 'heroHeadline',
      title: 'Hero Headline',
      type: 'string',
      description: 'e.g. "Building ROI-First AI Solutions"',
    }),
    defineField({
      name: 'heroSubheadline',
      title: 'Hero Sub-headline',
      type: 'text',
      rows: 3,
      description: 'Supporting paragraph below the hero headline',
    }),
    defineField({
      name: 'heroBadgeText',
      title: 'Hero Badge Text',
      type: 'string',
      description: 'Small badge above the headline (e.g. "AI Product Leader")',
    }),
    // ---- About section ----
    defineField({
      name: 'aboutNarrative',
      title: 'About Narrative',
      type: 'array',
      of: [{ type: 'block' }],
      description: 'Rich-text bio paragraphs for the About / AI Dad section',
    }),
    defineField({
      name: 'profileImageUrl',
      title: 'Profile / Portrait Image URL',
      type: 'url',
      description: 'Public URL for the portrait image in the About section',
    }),
    // ---- Contact & social links ----
    defineField({
      name: 'calendarBookingUrl',
      title: 'Calendar Booking URL',
      type: 'url',
      description: 'Google Calendar booking link shown in Contact section',
    }),
    defineField({
      name: 'linkedinUrl',
      title: 'LinkedIn URL',
      type: 'url',
    }),
    defineField({
      name: 'twitterUrl',
      title: 'Twitter / X URL',
      type: 'url',
    }),
    defineField({
      name: 'githubUrl',
      title: 'GitHub URL',
      type: 'url',
    }),
    defineField({
      name: 'emailAddress',
      title: 'Email Address',
      type: 'string',
    }),
    // ---- Substack / RSS ----
    defineField({
      name: 'substackUrl',
      title: 'Substack URL',
      type: 'url',
      description: 'Your Substack publication URL for the RSS feed proxy',
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
