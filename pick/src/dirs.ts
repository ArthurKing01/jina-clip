import path from 'path'

export const rootDir = path.resolve(__dirname, '..', '..')

export const glueDir = path.join(rootDir, 'glue')

export const jinaDir = path.join(rootDir, 'hello-jina2')

export const pickDir = path.join(rootDir, 'pick')

export const staticDir = path.join(jinaDir, 'static')

export const outputDir = path.join(staticDir, 'output')

export const videosDir = path.join(staticDir, 'videos')