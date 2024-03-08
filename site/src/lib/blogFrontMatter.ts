import z from "zod"

export const BlogFrontMatterSchema = z.object({
  title: z.string(),
  description: z.string(),
  author: z.string(),
  fSlug: z.string(),
  dop: z.coerce.date()
})

export type BlogFrontMatter = z.infer<typeof BlogFrontMatterSchema>