import MarkdownIt from 'markdown-it'

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
})

export interface Post {
  slug: string
  title: string
  date: string
  content: string
  html: string
}

function parseFrontmatter(raw: string): { data: Record<string, string>; content: string } {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n?/
  const match = raw.match(frontmatterRegex)

  if (!match) {
    return { data: {}, content: raw }
  }

  const frontmatterStr = match[1]
  const content = raw.slice(match[0].length)
  const data: Record<string, string> = {}

  for (const line of frontmatterStr.split('\n')) {
    const colonIndex = line.indexOf(':')
    if (colonIndex > 0) {
      const key = line.slice(0, colonIndex).trim()
      const value = line.slice(colonIndex + 1).trim()
      data[key] = value
    }
  }

  return { data, content }
}

const posts = import.meta.glob('@/posts/*.md', { eager: true })

export function getAllPosts(): Post[] {
  const postList: Post[] = []

  for (const [path, module] of Object.entries(posts)) {
    const slug = path.split('/').pop()?.replace('.md', '') || ''
    const raw = (module as { default: string }).default
    const { data, content } = parseFrontmatter(raw)
    const html = md.render(content)

    postList.push({
      slug,
      title: data.title || slug,
      date: data.date || '',
      content,
      html,
    })
  }

  return postList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function getPostBySlug(slug: string): Post | undefined {
  return getAllPosts().find((post) => post.slug === slug)
}
