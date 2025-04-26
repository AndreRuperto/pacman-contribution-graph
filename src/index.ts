// src/index.ts
import * as core from '@actions/core';

// ⬇️  troque .js por .ts  (ou tire a extensão)  ------------------
import { generateSvg } from '../scripts/generate-svg';      // <- aqui

import type { ThemeKeys } from '../types.js';

(async () => {
  try {
    await generateSvg({
      username:  core.getInput('github_user_name', { required: true }),
      token:     core.getInput('github_token'),
      theme:     core.getInput('theme') as ThemeKeys,
      outputDir: core.getInput('output_directory')
    });
  } catch (err) {
    core.setFailed((err as Error).message);
  }
})();