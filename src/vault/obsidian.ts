/**
 * Settings for a vault opened in Obsidian ("Open folder as vault"): links follow renames, the front matter stays out of
 * the way, and skill notes stand out in the graph view, which then reads as the learner's skill map.
 */
export function obsidianSettings(skillsFolder: string, inSubfolder = ''): Record<string, string> {
  const folder = inSubfolder ? `${inSubfolder}/${skillsFolder}` : skillsFolder
  return {
    'app.json': JSON.stringify({ alwaysUpdateLinks: true, showFrontmatter: false }, null, 2),
    'graph.json': JSON.stringify({ colorGroups: [{ query: `path:"${folder}"`, color: { a: 1, rgb: 16092476 } }] }, null, 2),
  }
}

/** The skills folder of a vault, whichever language it was built in. */
export function skillsFolderOf(paths: string[]): string {
  return paths.some((p) => p.startsWith('Beceriler/')) ? 'Beceriler' : 'Skills'
}
