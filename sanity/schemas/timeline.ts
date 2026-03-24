import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'timeline',
  title: 'Career Timeline',
  type: 'document',
  fields: [
    defineField({
      name: 'year',
      title: 'Year Range',
      type: 'string',
      description: 'e.g. "2023 - Present"',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'title',
      title: 'Job Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'company',
      title: 'Company',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 4,
    }),
    defineField({
      name: 'order',
      title: 'Sort Order',
      type: 'number',
      description: 'Lower number = displayed first',
    }),
  ],
  orderings: [
    {
      title: 'Year, New → Old',
      name: 'yearDesc',
      by: [{ field: 'order', direction: 'asc' }],
    },
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'company',
    },
  },
});
