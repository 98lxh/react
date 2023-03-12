import { ReactElementType } from "shared/ReactTypes";
import { mountChildChildFibers, reconcileChildFibers } from "./childFibers";
import { FiberNode } from "./fiber";
import { processUpdateQueue, UpdateQueue } from "./updateQueue";
import { HostComponent, HostRoot, HostText } from "./workTags";

export const beginWork = (wip: FiberNode) => {
  //递归中的递阶段
  //比较，返回子FiberNode
  switch (wip.tag) {
    case HostRoot:
      /**
       * HostRoot 工作流程
       * 1.计算状态最新值
       * 2.创建子fiberNode
      */
      return updateHostRoot(wip)
    case HostComponent:
      /**
       * HostComponent 工作流程
       * 1.创建子fiberNode
      */
      return updateHostComponent(wip)
    case HostText:
      /**
      * HostText 工作流程
      * 没有子节点(叶子节点)
      */
      return null
    default:
      if (__DEV__) {
        console.warn('beginWork未实现的类型')
      }
      break
  }
  return null
}


function updateHostRoot(wip: FiberNode) {
  const baseState = wip.memoizedState
  const updateQueue = wip.updateQueue as UpdateQueue<Element>
  const pending = updateQueue.shared.pending
  //计算完成将pending赋值为null
  updateQueue.shared.pending = null
  //拿到计算后的state
  const { memoizedState } = processUpdateQueue(baseState, pending)
  wip.memoizedState = memoizedState
  const nextChildren = wip.memoizedState;
  // wip.alternate -> current
  reconcileChildren(wip, nextChildren)
  return wip.child
}

function updateHostComponent(wip: FiberNode) {
  /***
   * <div><span></span></div>  -> div 的 children -> props.children
  */
  const nextProps = wip.pendingProps;
  const nextChildren = nextProps.children
  reconcileChildren(wip, nextChildren)
  return wip.child
}


function reconcileChildren(wip: FiberNode, children: ReactElementType | null) {
  //对比子节点的fiberNode和子节点的reactElement
  const current = wip.alternate

  if (current !== null) {
    // update
    wip.child = reconcileChildFibers(wip, current?.child, children)
  } else {
    // mount
    wip.child = mountChildChildFibers(wip, null, children)
  }
}
