import type { ComponentType } from 'react'
import type { RouteObject } from 'react-router-dom'

type ProjectModule = {
  default: ComponentType
  routes?: { path: string; Component: ComponentType }[]
  title?: string
  description?: string
}

const modules = import.meta.glob<ProjectModule>('../projects/*/index.tsx', { eager: true })

const previewGlob = import.meta.glob<string | { default: string }>(
  '../projects/*/preview.{png,jpg,jpeg,webp}',
  { eager: true, query: '?url', import: 'default' }
)

export const projectNames = Object.keys(modules)
  .map((k) => k.replace('../projects/', '').replace('/index.tsx', ''))
  .sort()

function getPreviewUrl(projectName: string): string | undefined {
  const key = Object.keys(previewGlob).find(
    (k) => k.startsWith(`../projects/${projectName}/preview.`)
  )
  if (!key) return undefined
  const v = previewGlob[key]
  return typeof v === 'string' ? v : v?.default
}

export type ProjectMeta = {
  name: string
  title?: string
  description?: string
  preview?: string
}

export const projectMeta: ProjectMeta[] = projectNames.map((name) => {
  const key = `../projects/${name}/index.tsx`
  const mod = modules[key] as ProjectModule | undefined
  return {
    name,
    title: mod?.title,
    description: mod?.description,
    preview: getPreviewUrl(name),
  }
})

export function getProjectRoutes(): RouteObject[] {
  const list: RouteObject[] = []

  for (const name of projectNames) {
    const key = `../projects/${name}/index.tsx`
    const mod = modules[key] as ProjectModule | undefined
    if (!mod?.default) continue
    const Layout = mod.default
    const childRoutes = mod.routes ?? [{ path: '/', Component: () => null }]
    list.push({
      path: name,
      element: <Layout />,
      children: childRoutes.map((r) => {
        const isIndex = r.path === '/' || r.path === ''
        return {
          index: isIndex,
          ...(isIndex ? {} : { path: r.path }),
          element: <r.Component />,
        }
      }),
    })
  }
  return list
}
