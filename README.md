### tMind-svr

> ##### 注意事项

  ##### 项目根仓库中，采用 YARN 管理依赖包，全局依赖，请使用 PNPM 或 YARN gloable add ...，尽量不使用 npm

  ##### 在.vscode / settings.json 配置文件中的 "typescript.tsdk": "%YARN_Typescript_Lib%"，其中，%YARN_Typescript_Lib% 代表系统环境变量中的设定。

  ##### 通常情况下，"typescript.tsdk" 会设置为: "node_modules/typescript/lib"，但由在 tFrame　根仓库的模式下，项目文件夹并不存放 node_modules 文件夹。

  ##### 因此设置为从全局安装的 typescrip 中寻找指定环境，同时需要手工将全局的yarn global中的 typescrip/lib 路径配置到环境变量（YARN_Typescript_Lib）中

> ##### 安装
```
yarn install
```

> ##### 开发（ts 热编译为 js）
```
yarn dev
```

> ##### 用例尝试（源文件保存后，同步热更新）
```
yarn try
```

> ##### 用例文档自动生成
```
yarn doc
```

> ##### 发布（同步github 和 npm）
```
yarn build
```

> ##### 测试
```
yarn test

// 测试并生成覆盖率报告
yarn test-c
```

> ##### 代码规范检查
```
yarn lint
```

> ##### [使用用例](./docs/useage.md)



> #### About
See [About more](https://www.smpoo.com).
See [gitHub repo](https://github.com/fanzouguo/tMind-svr.git).

