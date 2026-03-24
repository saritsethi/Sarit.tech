import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { schemaTypes } from './schemas';

const projectId = process.env.SANITY_PROJECT_ID || 'placeholder';
const dataset = process.env.SANITY_DATASET || 'production';

export default defineConfig({
  name: 'sarit-tech',
  title: 'sarit.tech CMS',
  projectId,
  dataset,
  plugins: [structureTool()],
  schema: {
    types: schemaTypes,
  },
});
