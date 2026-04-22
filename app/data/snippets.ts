export interface Snippet {
	id: string
	title: string
	description?: string
	language: string
	code: string
	filename?: string
}

export const snippets: Snippet[] = [
	{
		id: 'github-actions-deploy',
		title: 'GitHub Actions 部署配置',
		description: 'Nuxt 应用自动部署到服务器的 GitHub Actions 配置',
		language: 'yaml',
		filename: '.github/workflows/deploy.yml',
		code: `name: deploy nuxt app
on:
  push:
    branches:
      - main
jobs:
  deploy:
    runs-on: ubuntu-24.04
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        name: Install pnpm
        with:
          version: 10.24.0
          run_install: false

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 24.x
          cache: pnpm

      - name: Install dependencies
        run: pnpm install

      - name: Build the app
        run: pnpm run build

      - name: Deploy to Server
        uses: appleboy/scp-action@v1
        with:
          host: \${{ secrets.WXW_HOST }}
          username: \${{ secrets.WXW_USERNAME }}
          password: \${{ secrets.WXW_PASSWORD }}
          port: 22
          source: .output/
          target: \${{ secrets.WXW_TARGET }}`,
	},
	{
		id: 'pnpm-workspace',
		title: 'pnpm 工作区配置',
		description: '配置 pnpm 工作区，支持 monorepo 项目结构',
		language: 'yaml',
		filename: 'pnpm-workspace.yaml',
		code: `packages:
  - 'packages/*'
  - 'apps/*'
  - '!**/test/**'`,
	},
	{
		id: 'pinia-store',
		title: 'Pinia 常用仓库配置',
		description: '使用 Composition API 风格的 Pinia Store 配置',
		language: 'typescript',
		filename: 'app.store.ts',
		code: `import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('appStore', () => {
  const user = ref(null)

  return {
    user,
  }
})`,
	},
	{
		id: 'pinia-usage',
		title: 'Pinia Store 使用',
		description: '在 Vue 组件中使用 Pinia Store',
		language: 'vue',
		filename: 'app.vue',
		code: `<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useAppStore } from '@/store/app.store'

const appStore = useAppStore()
const { user } = storeToRefs(appStore)
<\/script>`,
	},
	{
		id: 'nestjs-transform',
		title: 'NestJS 全局响应拦截器',
		description: '统一接口返回格式，添加状态码和消息',
		language: 'typescript',
		filename: 'transform.interceptor.ts',
		code: `import type { IResponse, IResponseWithExtra } from 'src/types/response.type';
import { CallHandler, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export class TransformInterceptor<T = any>
  implements NestInterceptor<T, IResponse<T>> {
  intercept(_, next: CallHandler<T>): Observable<IResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        const responseData = data as T | IResponseWithExtra<T>;
        if (
          responseData instanceof Object
          && 'data' in responseData
          && 'extra' in responseData
        ) {
          return {
            data: responseData.data!,
            status: 200,
            extra: responseData.extra || {},
            message: 'success',
            success: true,
          };
        }
        return {
          data,
          status: 200,
          extra: {},
          message: 'success',
          success: true,
        };
      }),
    );
  }
}`,
	},
	{
		id: 'response-types',
		title: '响应类型定义',
		description: 'NestJS 统一响应接口的类型定义',
		language: 'typescript',
		filename: 'types/response.type.ts',
		code: `export interface IResponse<T> {
  data: T
  status: number
  extra: Record<string, any>
  message: string
  success: boolean
}

export interface IResponseWithExtra<T, R = Record<string, any>> {
  data?: T
  extra?: R
}

interface IPaginationExtra {
  total: number
  page: number
  pageSize: number
  [key: string]: any
}

export interface IResponseWithPagination<T, R = IPaginationExtra> {
  data?: T[]
  extra?: R
}`,
	},
	{
		id: 'vscode-snippets',
		title: 'VSCode 代码片段',
		description: '常用的 VSCode 自定义代码片段配置',
		language: 'json',
		filename: '.vscode/snippets.json',
		code: `{
  "vue3 setup base": {
    "prefix": "v3",
    "body": [
      "<script lang='ts' setup>",
      "",
      "<\\/script>",
      "",
      "<template>",
      "$1",
      "<\\/template>",
      "",
    ],
    "description": "vue3 setup base",
  },
  "pinia base": {
    "prefix": "v3-store",
    "body": [
      "import { defineStore } from 'pinia'",
      "",
      "export const use\${TM_FILENAME_BASE/^(.)|-(.)/\${1:/capitalize}\${2:/capitalize}/g} = defineStore('$TM_FILENAME_BASE', () => {",
      "    ",
      "",
      "    return {",
      "        ",
      "    }",
      "})",
    ],
    "description": "pinia base",
  },
}`,
	},
	{
		id: 'eslint-config',
		title: 'ESLint 配置覆盖',
		description: '对 @antfu/eslint-config 的自定义覆盖规则',
		language: 'javascript',
		filename: 'eslint.config.js',
		code: `import antfu from '@antfu/eslint-config'
import pluginQuery from '@tanstack/eslint-plugin-query'

export default antfu({
  type: 'app',
  vue: {
    overrides: {
      'vue/block-lang': ['warn', {
        script: { lang: ['ts', 'tsx'] },
      }],
    },
  },
  typescript: true,
  formatters: {
    css: true,
    html: true,
    markdown: 'prettier',
  },
  ignores: [
    '**/build/**',
    '**/components/ui/**',
  ],
  settings: {
    'import/core-modules': ['vue-router/auto-routes'],
  },
  globals: {
    definePage: 'readonly',
  },
  imports: {
    overrides: {
      'perfectionist/sort-imports': ['error', {
        tsconfig: { rootDir: '.' },
      }],
    },
  },
  ...pluginQuery.configs['flat/recommended'],
})`,
	},
	{
		id: 'nginx-vue-history',
		title: 'Nginx Vue History 模式配置',
		description: 'Vue Router History 模式在 Nginx 下的伪静态配置',
		language: 'nginx',
		filename: 'nginx.conf',
		code: `location / {
    try_files $uri $uri/ /index.html last;
    index index.html;
}

add_header 'Access-Control-Allow-Origin' '*' always;
add_header 'Access-Control-Allow-Credentials' 'true' always;
add_header 'Access-Control-Allow-Headers' 'Origin, X-Requested-With, Content-Type, Accept, token, platform' always;
add_header 'Access-Control-Allow-Methods' 'GET,POST,PUT,DELETE,HEAD,OPTIONS' always;

if ($request_method = OPTIONS ) {
    return 200;
}`,
	},
]
