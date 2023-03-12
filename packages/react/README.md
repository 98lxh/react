# react

## JSX实现
jsx转换包含两部分:
  - 编译时
  - 运行时： `jsx`方法或`Reacr.createElement` 方法的实现(包括dev、prod两个环境)

`编译时`由`babel`编译实现

`jsx`方法包括:
  - [jsxDEV方法(dev环境)](./src/jsx.ts)
  - [jsx方法(prod环境)](./src/jsx.ts)
  - [ReactCreateElement方法](./src/jsx.ts)


对应的打包产出文件
  - react/jsx-dev-runtime(dev环境)
  - react/jsx-runtime(prod)环境
  - React
