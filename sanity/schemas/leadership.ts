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
  { title: 'BarChart2', value: 'BarChart2' },
  { title: 'Lightbulb', value: 'Lightbulb' },
];

export default defineType({
  name: 'leadership',
  title: 'AI Dad — Leadership Page',
  type: 'document',
  __experimental_actions: ['update', 'publish'],
  fields: [
    defineField({
      name: 'strategyTitle',
      title: 'Strategy Section Title',
      type: 'string',
      description: 'Heading for the AI strategy pillars section, e.g. "My AI Leadership Framework"',
    }),
    defineField({
      name: 'aiPillars',
      title: 'AI Strategy Pillars',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'aiPillar',
          title: 'AI Pillar',
          fields: [
            {
              name: 'title',
              title: 'Title',
              type: 'string',
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'description',
              title: 'Description',
              type: 'text',
              rows: 3,
            },
            {
              name: 'icon',
              title: 'Icon',
              type: 'string',
              options: { list: ICON_OPTIONS },
              description: 'Lucide icon name rendered on the page',
            },
          ],
          preview: {
            select: { title: 'title', subtitle: 'icon' },
          },
        },
      ],
      description: 'The AI strategy pillars displayed on the AI Dad page',
    }),
    defineField({
      name: 'frameworkPDF',
      title: 'Framework PDF / Whitepaper',
      type: 'file',
      options: { accept: '.pdf' },
      description: 'Upload a PDF whitepaper or framework document for download',
    }),
    defineField({
      name: 'missionStatement',
      title: 'Mission Statement',
      type: 'text',
      description: 'Short mission statement displayed on the AI Dad page',
    }),
    defineField({
      name: 'leadershipPhilosophy',
      title: 'Leadership Philosophy',
      type: 'array',
      of: [{ type: 'block' }],
      description: 'Rich text — the core leadership philosophy paragraphs',
    }),
    defineField({
      name: 'keyMetrics',
      title: 'Key Metrics',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'keyMetric',
          title: 'Metric',
          fields: [
            { name: 'value', title: 'Metric Value', type: 'string', description: 'e.g. "40%"' },
            { name: 'label', title: 'Label', type: 'string', description: 'e.g. "Cost Reduction"' },
            { name: 'description', title: 'Description', type: 'string' },
          ],
          preview: {
            select: { title: 'value', subtitle: 'label' },
          },
        },
      ],
    }),
    defineField({
      name: 'quote',
      title: 'Leadership Quote',
      type: 'text',
      description: 'A memorable quote attributed to Sarit for the AI Dad page',
    }),
  ],
  preview: {
    select: { title: 'strategyTitle' },
    prepare({ title }: { title?: string }) {
      return { title: title || 'AI Dad Leadership Page' };
    },
  },
});
