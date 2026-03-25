import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'about',
  title: 'About Page',
  type: 'document',
  __experimental_actions: ['update', 'publish'],
  fields: [
    defineField({
      name: 'portrait',
      title: 'Portrait Image',
      type: 'image',
      options: { hotspot: true },
      description: 'Profile photo displayed on the About page',
    }),
    defineField({
      name: 'narrative',
      title: 'Personal Journey',
      type: 'array',
      of: [{ type: 'block' }],
      description: 'Rich-text paragraphs for the personal story section',
    }),
    defineField({
      name: 'cricketStats',
      title: 'Cricket Stats & Interests',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'cricketStat',
          title: 'Cricket Stat',
          fields: [
            {
              name: 'aspect',
              title: 'Aspect / Label',
              type: 'string',
              description: 'e.g. "Batting Style", "Favourite Shot", "Club"',
            },
            {
              name: 'value',
              title: 'Value / Detail',
              type: 'string',
              description: 'e.g. "Right-handed", "Cover drive", "Chicago Cricket Club"',
            },
          ],
          preview: {
            select: { title: 'aspect', subtitle: 'value' },
          },
        },
      ],
      description: 'Fun cricket facts and bat specification details',
    }),
  ],
  preview: {
    select: { media: 'portrait' },
    prepare() {
      return { title: 'About Page' };
    },
  },
});
