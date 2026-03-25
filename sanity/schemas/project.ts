import { defineType, defineField } from 'sanity';

const STATUS_OPTIONS = [
  { title: 'Active / Live', value: 'active' },
  { title: 'Coming Soon', value: 'coming-soon' },
  { title: 'Archived', value: 'archived' },
];

export default defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (Rule) => Rule.required(),
      description: 'Auto-generated from title — used for URLs',
    }),
    defineField({
      name: 'thumbnail',
      title: 'Thumbnail Image',
      type: 'image',
      options: { hotspot: true },
      description: 'Project card image with responsive hotspot cropping',
    }),
    defineField({
      name: 'videoUrl',
      title: 'Video URL',
      type: 'url',
      description: 'YouTube or Loom demo video link',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'array',
      of: [{ type: 'block' }],
      description: 'Rich text project description',
    }),
    defineField({
      name: 'technologies',
      title: 'Technologies',
      type: 'array',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
      description: 'Tech stack tags (e.g. React, Python, Gemini Pro)',
    }),
    defineField({
      name: 'tech',
      title: 'Tech Stack (Legacy)',
      type: 'array',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
      description: 'Legacy field — use Technologies above for new projects',
      hidden: true,
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: { list: STATUS_OPTIONS, layout: 'radio' },
      initialValue: 'active',
    }),
    defineField({
      name: 'link',
      title: 'External Link',
      type: 'url',
      description: 'GitHub, demo, or case study URL',
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
      title: 'Sort Order',
      name: 'orderAsc',
      by: [{ field: 'order', direction: 'asc' }],
    },
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'status',
      media: 'thumbnail',
    },
  },
});
