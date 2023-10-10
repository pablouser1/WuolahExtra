import metablock from 'rollup-plugin-userscript-metablock'
import typescript from '@rollup/plugin-typescript'
import serve from 'rollup-plugin-serve'
import sass from 'rollup-plugin-sass'
import pkg from './package.json' assert {type: "json"}

const plugins = [
  metablock({
    file: './meta.json',
    override: {
      name: 'WuolahExtra',
      version: pkg.version,
      description: pkg.description,
      homepage: pkg.homepage,
      author: pkg.author,
      license: pkg.license,
    }
  }),
  typescript(),
  sass()
]

if (process.env.APP_MODE === 'development') {
  plugins.push(serve({
    contentBase: ['dist'],
    headers: {
      'Cache-Control': 'public, max-age=5'
    }
  }))
}

/** @type {import('rollup').RollupOptions} */
const config = {
  input: 'src/index.ts',
  output: {
    file: 'dist/WuolahExtra.user.js',
    format: 'esm',
    sourcemap: true
  },
  plugins
}

export default config
