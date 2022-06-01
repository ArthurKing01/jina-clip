const path = require('path')
const fse = require("fs-extra")

const distDir = path.resolve(__dirname, '..', 'dist')
const publicDir = path.resolve(__dirname, '..', '..', 'hello-jina2', 'static', 'public')


fse.emptyDirSync(publicDir)

fse.copySync(distDir, publicDir)