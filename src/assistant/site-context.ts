import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { artifactDirectories } from './artifacts.js';

type SitePage = {
  path: string;
  title: string;
  component: string;
  access: string;
  text: string;
  redirectTo?: string;
};

type SiteNavItem = {
  label: string;
  path?: string;
  children?: { label: string; path: string }[];
};

type SiteMap = {
  navigation: SiteNavItem[];
  pages: SitePage[];
};

export async function siteContext(page?: string) {
  const siteMap = await loadSiteMap();
  if (!siteMap) {
    return 'The website page index is not available.';
  }

  const lines = [
    'Website pages indexed from the React route table at build time.',
    '',
    'Navigation',
    ...navigationLines(siteMap.navigation),
    '',
    'Pages',
    ...siteMap.pages.map((entry) => formatPage(entry)),
    '',
    currentPageLine(siteMap, page),
  ];
  return lines.join('\n');
}

async function loadSiteMap(): Promise<SiteMap | null> {
  for (const directory of artifactDirectories) {
    try {
      const parsed = JSON.parse(
        await readFile(path.join(directory, 'site-map.json'), 'utf8'),
      ) as Partial<SiteMap>;
      if (!Array.isArray(parsed.pages) || !Array.isArray(parsed.navigation)) {
        continue;
      }
      return { navigation: parsed.navigation, pages: parsed.pages };
    } catch {
      continue;
    }
  }
  return null;
}

function navigationLines(navigation: SiteNavItem[]) {
  const lines: string[] = [];
  for (const item of navigation) {
    if (item.children) {
      lines.push(`- ${item.label}`);
      for (const child of item.children) {
        lines.push(`  - ${child.label} (${child.path})`);
      }
    } else if (item.path) {
      lines.push(`- ${item.label} (${item.path})`);
    }
  }
  return lines;
}

function formatPage(page: SitePage) {
  const lines = [
    `## ${page.title} (${page.path})`,
    `Component: ${page.component}`,
    `Access: ${page.access}`,
  ];
  if (page.redirectTo) {
    lines.push(`Redirects to: ${page.redirectTo}`);
  }
  if (page.text) {
    lines.push(page.text);
  }
  return lines.join('\n');
}

function currentPageLine(siteMap: SiteMap, page?: string) {
  if (!page) {
    return "The visitor's current page was not included with this question.";
  }
  const match = siteMap.pages.find((entry) => entry.path === page);
  if (!match) {
    return `The visitor is on ${page}, which is not a named page. Unknown paths redirect to Home (/).`;
  }
  if (match.redirectTo) {
    return `The visitor is on ${match.title} (${match.path}), which redirects to ${match.redirectTo}. Questions about this page refer to that destination.`;
  }
  return `The visitor is currently on ${match.title} (${match.path}). Questions about this page, this screen, or what the visitor is looking at refer to ${match.title}.`;
}
