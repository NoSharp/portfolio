import z from "zod"

export const BlogFrontMatterSchema = z.object({
  title: z.string(),
  description: z.string(),
  author: z.string(),
  dop: z.coerce.date(),
  wip: z.boolean()
})

export type BlogFrontMatter = z.infer<typeof BlogFrontMatterSchema>