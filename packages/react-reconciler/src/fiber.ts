import { Props, Key, Ref, ReactElementType } from 'shared/ReactTypes';
import { Flags, NoFlags } from './fiberFlags';
import { FunctionComponent, HostComponent, WorkTag } from './workTags';
import { Container } from "hostConfig";


export class FiberNode {
  key: Key;
  type: any;
  tag: WorkTag;
  stateNode: any;
  pendingProps: Props;
  memoizedProps: Props;

  //更新完成后的state
  memoizedState: any

  //FiberNode 和 对应的另一个FirberNode之间切换
  //如:如果当前FiberNode 是current fiberNode那么它对应的FiberNode就是workInProgress fiberNode
  alternate: FiberNode | null;
  flags: Flags
  //子树中包含的flags
  subtreeFlags: Flags

  return: FiberNode | null;
  sibling: FiberNode | null;
  child: FiberNode | null;
  index: number;
  ref: Ref;

  updateQueue: unknown

  /***
   * @param tag 节点标签
   * @param pendingProps 节点接下来有哪些Props
   * @param key 节点的key
   */
  constructor(tag: WorkTag, pendingProps: Props, key: Key) {
    this.tag = tag;
    this.key = key;
    // HostComponent ->  <div /> -> 保存div DOM
    this.stateNode = null;
    //FunctionComponent -> FiberNode的类型 -> Tag:0,type:() =>{}
    this.type = null;


    /* 构成树状结构 **/
    //指向父FiberNode
    this.return = null;
    //指向同级FirberNode
    this.sibling = null;
    //指向子FirberNode
    this.child = null;
    /***
     * 同级有多个
     * <ul>
     *  <li />  -> index:0
     *  <li />  -> index:1
     *  <li />  -> index:2
     * </ui>
     */
    this.index = 0;

    this.ref = null;


    /* 作为工作单元 **/
    //工作单元刚开始准备工作时它的props
    this.pendingProps = pendingProps;
    //工作单元工作完成后的props 确定下来的props
    this.memoizedProps = null;
    this.memoizedState = null
    this.updateQueue = null;

    this.alternate = null;

    //副作用
    this.flags = NoFlags;
    this.subtreeFlags = NoFlags
  }
}


export class FiberRootNode {
  /* 根节点的容器 **/
  container: Container;
  /* 指向hostRootRiber **/
  current: FiberNode;
  /* 指向整个更新完成以后的hostRootFiber **/
  finishedWork: FiberNode | null;

  constructor(container: Container, hostRootFiber: FiberNode) {
    this.container = container;
    this.current = hostRootFiber;
    hostRootFiber.stateNode = this;
    this.finishedWork = null;
  }

}


export const createWorkInProgress = (current: FiberNode, pendingProps: Props): FiberNode => {
  //每次获取都是对应的另一个FiberNode
  let wip = current.alternate;

  if (wip === null) {
    //当首屏渲染时，workInProgress就是null,所以workInProgress为null就是首次挂载
    wip = new FiberNode(current.tag, pendingProps, current.key)
    wip.stateNode = current.stateNode
    wip.alternate = current
    current.alternate = wip
  } else {
    //更新流程：更新pendingProps
    wip.pendingProps = pendingProps
    //清除副作用 因为它有可能是上次更新遗留下来的
    wip.flags = NoFlags;
    wip.subtreeFlags = NoFlags
  }

  wip.type = current.type
  wip.updateQueue = current.updateQueue
  wip.child = current.child
  wip.memoizedProps = current.memoizedProps
  wip.memoizedState = current.memoizedState
  return wip
}

/**
 * 根据element创建fiber
*/
export function createFiberFormElement(element: ReactElementType): FiberNode {
  const { type, key, props } = element;
  let fiberTag: WorkTag = FunctionComponent

  if (typeof type === 'string') {
    fiberTag = HostComponent
  } else if (typeof type !== 'function' && __DEV__) {
    console.warn("未定义的type类型", element)
  }

  const fiber = new FiberNode(fiberTag, props, key)
  fiber.type = type
  return fiber
}
