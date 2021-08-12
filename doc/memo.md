### 作为新的NPM模版时，需要修改的地方：

1. 修改 package.json的 name

1. 修改 package.json的 version

1. 修改 package.json的引用

1. 修改 rollup配置的不打包列表

1. tsconfig.json 中 path -> tmind 改为相应的包名（小驼峰）

2. types/index.d.ts 中的命名空间

3. "createAt": 字段