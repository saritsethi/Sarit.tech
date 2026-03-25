export default {
  name: 'leadership',
  title: 'AI Dad — Leadership Page',
  type: 'document',
  fields: [
    {
      name: 'missionStatement',
      title: 'Mission Statement',
      type: 'text',
      description: 'Short mission statement displayed on the AI Dad page',
    },
    {
      name: 'leadershipPhilosophy',
      title: 'Leadership Philosophy',
      type: 'array',
      of: [{ type: 'block' }],
      description: 'Rich text — the core leadership philosophy paragraphs',
    },
    {
      name: 'keyMetrics',
      title: 'Key Metrics',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'value', title: 'Metric Value', type: 'string' },
            { name: 'label', title: 'Label', type: 'string' },
            { name: 'description', title: 'Description', type: 'string' },
          ],
        },
      ],
    },
    {
      name: 'quote',
      title: 'Leadership Quote',
      type: 'text',
      description: 'A memorable quote attributed to Sarit for the AI Dad page',
    },
  ],
};
