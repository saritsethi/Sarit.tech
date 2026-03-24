import { defineType, defineField } from 'sanity';

const ICON_OPTIONS = [
  { title: 'Target', value: 'Target' },
  { title: 'Users', value: 'Users' },
  { title: 'Layers', value: 'Layers' },
  { title: 'ShieldCheck', value: 'ShieldCheck' },
  { title: 'Zap', value: 'Zap' },
  { title: 'TrendingUp', value: 'TrendingUp' },
  { title: 'Brain', value: 'Brain' },
  { title: 'Globe', value: 'Globe' },
];

export default defineType({
  name: 'strategyPillar',
  title: 'Strategy Pillar',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'icon',
      title: 'Icon',
      type: 'string',
      options: {
        list: ICON_OPTIONS,
      },
      description: 'Lucide icon name rendered in the Strategy section',
    }),
    defineField({
      name: 'order',
      title: 'Sort Order',
      type: 'number',
    }),
  ],
  orderings: [
    {
      title: 'Sort Order',
      name: 'orderAsc',
      by: [{ field: 'order', direction: 'asc' }],
    },
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'icon',
    },
  },
});
