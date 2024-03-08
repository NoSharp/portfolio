import rss from "@astrojs/rss";
import type { BlogFrontMatter } from "@lib/blogFrontMatter";
import { getCollection } from "astro:content";

export async function GET() {
  const blog = await getCollection<"blog">("blog");
  return rss({
    title: "plsno.cc",
    description: "Breaking the planet, one blog at a time",
    site: "https://plsno.cc",
    items: blog.map((post) => {
      const postData: BlogFrontMatter = post.data as BlogFrontMatter
      return {
        title: postData.title,
        pubDate: postData.dop,
        description: postData.description,
        customData: "",
        // Compute RSS link from post `slug`
        // This example assumes all posts are rendered as `/blog/[slug]` routes
        link: `/blog/${postData.slug}/`,
      };
    }),
    customData: `<language>en-us</language>`,
  });
}
