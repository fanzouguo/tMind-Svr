# mpa

## 项目根仓库中，采用 YARN 管理依赖包，全局依赖，请使用 PNPM 或 YARN gloable add ...，尽量不使用 npm

> ### 注意事项

#### 在 .vscode / settings.json 配置文件中的 "typescript.tsdk": "%YARN_Typescript_Lib%"，其中，%YARN_Typescript_Lib% 代表系统环境变量中的设定。
#### 通常情况下，"typescript.tsdk" 会设置为: "node_modules/typescript/lib"，但由在 tFrame　根仓库的模式下，项目文件夹并不存放 node_modules 文件夹。
#### 因此设置为从全局安装的 typescrip 中寻找指定环境，同时需要手工将全局的yarn global中的 typescrip/lib 路径配置到环境变量（YARN_Typescript_Lib）中

```
yarn install
```

### Compiles and hot-reloads for development
```
yarn dev
```

### Compiles and minifies for production
```
yarn build
```

### Run your unit tests
```
yarn test:unit
```

### Run your end-to-end tests
```
yarn test:e2e
```

### Lints and fixes files
```
yarn lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

