import { appendInitalChild, Container, createInstance, createTextInstance } from "hostConfig";
import { FiberNode } from "./fiber";
import { NoFlags } from "./fiberFlags";
import { HostComponent, HostRoot, HostText } from "./workTags";

//递归中的归
export const completeWork = (wip: FiberNode) => {
  const newProps = wip.pendingProps
  const current = wip.alternate

  switch (wip.tag) {
    case HostComponent:
      if (current !== null && wip.stateNode) {
        //stateNode -> 对应的dom -> update流程
      } else {
        /* 1. 构建DOM **/
        // const instance = createInstance(wip.type, newProps) // 对应浏览器环境 -> instance === dom
        const instance = createInstance(wip.type) // 对应浏览器环境 -> instance === dom
        /* 2. 将DOM插入到DOM树中 **/
        appendAllChildrne(instance, wip)
        wip.stateNode = instance
      }
      bubbleProperties(wip)
      return null
    case HostText:
      if (current !== null && wip.stateNode) {
        //stateNode -> 对应的dom -> update流程
      } else {
        /* 1. 构建文本节点 **/
        const instance = createTextInstance(newProps.content)
        /* 2. 将文本节点插入到DOM树中 **/
        wip.stateNode = instance
      }
      bubbleProperties(wip)
      return null
    case HostRoot:
      bubbleProperties(wip)
      return null
    default:
      if (__DEV__) {
        console.warn("未处理的completeWork情况", wip)
      }
      break
  }
}

/**
 * 插入workInProgress到parent节点
 * @param parent 父fiberNode
 * @param wip 正在工作的fiberNode
*/
function appendAllChildrne(parent: Container, wip: FiberNode) {
  /**
   * workInProgress有可能不是一个节点例:
   * <div><App /></div>
   * 需要递归获得HostText或HostComponent类型的节点
  */
  let node = wip.child;
  while (node !== null) {
    if (node?.tag === HostText || node?.tag === HostComponent) {
      appendInitalChild(parent, node.stateNode)
    } else if (node.child !== null) {
      node.child.return = node
      node = node.child
      continue
    }

    if (node === wip) {
      return
    }

    /* 向下遍历没有找到，兄弟节点也没有 -> 向上查找 **/
    while (node.sibling === null) {
      /* 回到原点 **/
      if (node.return === null || node.return === wip) {
        return;
      }

      /* 向上 **/
      node = node?.return
    }

    node.sibling.return = node.return
    node = node.sibling
  }
}


function bubbleProperties(wip: FiberNode) {
  let subtreeFlags = NoFlags;
  let child = wip.child;

  while (child !== null) {
    //包含当前节点的子节点flags和当前节点子节点的subtreeFlags
    subtreeFlags |= child.subtreeFlags;
    subtreeFlags |= child.flags
    child.return = wip;
    child = child.sibling
  }
  //将遍历到的所有subtreeflags附加到当前节点的subtreeFlags
  wip.subtreeFlags |= subtreeFlags;
}
