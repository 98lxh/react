# react-reconciler

## reconciler的作用
reconciler是React的协调器

- jQuery的工作原理
```javascript
          调用                   调用 
jQuery  ---------> 宿主环境API ---------> 真实API

```

- 前端框架工作原理(状态驱动):
```javascript
                  编译优化                             调用                          显示
  描述UI的方法  -------------->   运行时核心模块  ------------------>   宿主环境API  ----------->    真实UI
  -> JSX(React)                  -> reconciler(React)
  -> 模板语法(Vue)                -> renderer(Vue) 

```

对于`React`来说，它消费`jsx`且没有编译优化(React是一个纯运行时的前端框架),React没有指定的宿主环境可以开放通用的API给不同的`宿主环境`

## reconciler如何消费jsx
ReactElement作为核心模块操作的数据结构存在的问题:
- 无法表达节点之间的关系
- 字段有限，不利于扩展(例:无法表达状态)

所以需要实现一种新的结构，他的特点是:
- 介于ReactElement和真实UI节点(对于浏览器这个宿主环境来说就是DOM)之间
- 能够表达节点之间的关系
- 方便扩展(不仅作为数据存储单元，也能作为工作单元)

而这个结构就是[FiberNode(虚拟DOM在React中的实现，Vue中为VNode)](./src/fiber.ts)


## reconciler的工作方式
对于同一个节点，比较其ReactElement与FiberNode，并且根据比较结果不同生成不同的标记(插入、删除、移动......),对应不同的宿主环境API执行

```javascript
               比较                     产出
ReactElement ---------> FiberNode  ----------->  各种标记
                            |
                            |生
                            |成
                            ↓
ReactElement ---------> 子FiberNode -----------> 各种标记  
                            |
                            |生
                            |成
                            ↓
                        孙FiberNode                  
```

例:

挂载`<div></div>`:
```javascript
//ReactElement <div></div>
//babel编译后 ↓ 
jsx("div");
//对应的FirberNode ↓
null //(没有FirberNode)
//生成子FirberNode
//对应的标记
Placement(插入)
```

将`<div></div>`更新为`<p></p>`:
```javascript
//ReactElement <p></p>
jsx("p");
//对应的FiberNode
FiberNode {type:"div"}
//生成子Fibernode
//对应的标记 ↓
Deletion(删除) Placement(插入)
```

当所有的ReactElement比较完成后，会生成一棵新的FiberNode树，一共存在两棵FiberNode树(双缓冲技术)：
- current:与视图中真实UI对应的FiberNode树
- workInProgress:触发更新后，正在reconciler中计算的FiberNode树


## JSX的消费顺序
以DFS(深度优先遍历)的顺序遍历ReactElement:
- 如果有子节点，遍历子节点
- 如果没有子节点遍历兄弟节点

消费过程是一个递归的过程，存在递、归两个节点:
- 递:对应[beginWork方法](./src/beginWork.ts)
- 归:对应[completeWork方法](./src/completeWork.ts)

子组件先unmount,然后父组件unmount

## 触发更新
常见触发更新的操作:
- ReactDOM.createRoot().render(对应旧版ReactDOM.render)
- this.setState(对应class component)
- useState的dispatch方法(对应functional component)

如果需要实现一套统一的更新机制，他的特点是:
- 兼容上述所有的触发方式
- 方便后续扩展(优先级机制)

### 更新机制的组成部分
- 代表更新的数据结构 --- [Update](./src/updateQueue.ts)
- 消费Update的数据结构的 --- [UpdateQueue](./src/updateQueue.ts)
- 实现mount时调用API
- 将该API接入上述的更新机制中
```
updateQueue
    ↓
shared.pending
    ↓
  update
  update
```

如果通过 `ReactDOM.createRoot`或`React.render`触发更新，那么它的更新是发生在根组件，而如果使用`setState`或`useState`更新，它就有可能是任意一个子节点。
同时需要一个统一的根节点保存通讯信息 

```javascript
ReactDOM.createRoot(rootElement).render(<App />) 
                      |
                      | 对应源码
                      ↓
                 fiberRootNode
                 |           ↑
         current |           | stateNode
                 ↓           |
                 hostRootFiber
                 |           ↑
         child   |           | return
                 ↓           |
                 Component App
```

## mount流程(首屏渲染)
更新流程的目的:
- 生成wip fiber树
- 标记副作用的flags

更新流程的步骤:

- 递:beginWork
- 归:completeWork

### beginWork
HostRoot的beginWork工作流程:
1. 计算状态的最新值
2. 创建子fiber

HostComponent的beginWork工作流程:
1. 创建子fiberNode

HostText没有beginWork流程因为它没有子节点

对于如下结构:
```html
<A>
  <B />
</A>
```
当进入A的beginWork的时候,通过对比B current fiberNode与B reactElement,生成B对应的wip fiberNode
在此过程中最多会标记两类与『结构变化』相关的flags:
- Placement:
插入: a -> ab 移动:abc -> bca
- ChildDeletion
删除: ul>li * 3 -> ul > li*1
- 不包括与属性相关的flags Update:
`<img title="鸡" /> `  -> `<img title="你太美" />` 


beginWork的优化策略：
```html
<div>
  <p>练习时长</p>
  <span>两年半</span>
</div>
```

  以上的示例理论上mount流程完毕后包含的flags:

- 两年半 Placment
- span Placement
- 练习时长 Placement
-  p Placement
- div Placemnt

相当于执行了五次Placement,此时我们可以优化为构建好『离屏DOM树』，对div执行一次Placment

### completeWork
- 对于Host类型的fiber：构建离屏dom树
- 标记Update flag(TODO)


### commit阶段
react内部有三个阶段:
- schedule阶段
- render阶段 -- [beginWork](./src/beginWork.ts)、[completeWork](./src/completeWork.ts)
- commit阶段 -- [commitWork](./src/commitWork.ts)

commit阶段有三个子阶段:
- beforeMutaiton阶段
- mutaiton阶段
- layout阶段

当前commit阶段需要执行的任务
- fiber树的切换
- 执行Placement对应的操作
