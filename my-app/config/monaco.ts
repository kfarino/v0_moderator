import { loader } from '@monaco-editor/react'

const monacoConfig = () => {
  loader.config({
    paths: {
      vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.33.0/min/vs'
    }
  })

  if (typeof window !== 'undefined') {
    window.MonacoEnvironment = {
      getWorkerUrl: function (_moduleId: any, label: string) {
        if (label === 'json') {
          return '/monaco-editor/json.worker.js'
        }
        if (label === 'css' || label === 'scss' || label === 'less') {
          return '/monaco-editor/css.worker.js'
        }
        if (label === 'html' || label === 'handlebars' || label === 'razor') {
          return '/monaco-editor/html.worker.js'
        }
        if (label === 'typescript' || label === 'javascript') {
          return '/monaco-editor/ts.worker.js'
        }
        return '/monaco-editor/editor.worker.js'
      }
    }
  }
}

export default monacoConfig

