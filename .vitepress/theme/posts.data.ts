import { createContentLoader } from "vitepress";

interface Post {
  layout: string;
  title: string;
  description: string;
  categories: string[];
  tags: string[];
  date: string;
  url: string;
}

declare const data: Post[];

export { Post, data };

export default createContentLoader("blog/_posts/*.md", {
  render: false,
  excerpt: false,
  transform: (raw): Post[] => {
    return raw
      .map(({ url, frontmatter }) => ({
        url,
        layout: frontmatter.layout,
        title: frontmatter.title,
        description: frontmatter.description,
        categories: frontmatter.categories,
        tags: frontmatter.tags,
        date: frontmatter.date,
      }))
      .sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateB.getTime() - dateA.getTime();
      });
  },
});
