import { createContentLoader } from "vitepress";

interface Post {
  layout: string;
  title: string;
  description: string;
  categories: string[];
  tags: string[];
  redirect_from?: string[];
}

declare const data: Post[];

export { Post, data };

export default createContentLoader("blog/_posts/*.md", {
  render: false,
  excerpt: false,
  transform: (raw): Post[] => {
    return raw
      .map(({ frontmatter }) => ({
        layout: frontmatter.layout,
        title: frontmatter.title,
        description: frontmatter.description,
        categories: frontmatter.categories,
        tags: frontmatter.tags,
        redirect_from: frontmatter.redirect_from,
      }))
      .sort((a, b) => b.title.localeCompare(a.title));
  },
});
