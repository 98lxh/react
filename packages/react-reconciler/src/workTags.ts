export type WorkTag =
  | typeof FunctionComponent
  | typeof HostRoot
  | typeof HostComponent
  | typeof HostText;

//函数组件Tag类型
export const FunctionComponent = 0;

//根节点组件Tag类型 => ReactDOM.render()
export const HostRoot = 3;

//普通的节点Tag类型 => div,span,h1.....
export const HostComponent = 5;

//文字节点Tag类型 => <span>hello</span>中的'hello'
export const HostText = 6;
