import topicData from './topics.json';

export interface BlogTopicDefinition {
  id: string;
  pillarSlug: string;
  clusterSlugs: string[];
  targetKeywords: string[];
  toolPathPrefixes: string[];
}

export type BlogTopicRole = 'pillar' | 'cluster';

export interface BlogTopicMembership {
  topic: BlogTopicDefinition;
  role: BlogTopicRole;
  targetKeyword: string | null;
}

export const blogTopics = topicData as BlogTopicDefinition[];

export function getBlogTopicByArticleSlug(slug: string): BlogTopicMembership | null {
  for (const topic of blogTopics) {
    if (topic.pillarSlug === slug) {
      return { topic, role: 'pillar', targetKeyword: null };
    }

    const clusterIndex = topic.clusterSlugs.indexOf(slug);
    if (clusterIndex >= 0) {
      return {
        topic,
        role: 'cluster',
        targetKeyword: topic.targetKeywords[clusterIndex] ?? null,
      };
    }
  }

  return null;
}

export function getPillarSlugForToolPath(toolPath: string): string | null {
  const topic = blogTopics.find((candidate) =>
    candidate.toolPathPrefixes.some((prefix) => toolPath.startsWith(prefix))
  );

  // Return null when no topic matches, so callers can omit the related-guide
  // link / subjectOf rather than pointing to an unrelated pillar article.
  return topic?.pillarSlug ?? null;
}
