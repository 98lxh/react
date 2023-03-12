import { appendChildToContainer, Container } from "hostConfig";
import { FiberNode, FiberRootNode } from "./fiber";
import { MutaitonMask, NoFlags, Placement } from "./fiberFlags";
import { HostComponent, HostRoot, HostText } from "./workTags";

/* 指向下一个需要执行的effect **/
let nextEffect: FiberNode | null = null

export const commitMutaitonEffects = (finishedWork: FiberNode) => {
  nextEffect = finishedWork

  while (nextEffect !== null) {
    //向下遍历
    const child: FiberNode | null = nextEffect.child

    /* 有mutaiton阶段的操作 **/
    if ((nextEffect.subtreeFlags & MutaitonMask) !== NoFlags && child !== null) {
      nextEffect = child
    } else {
      //找到了根节点或者它不包含subtreeFlags
      //不包含subtreeFlags有可能存在flags

      // 向上遍历DFS
      up: while (nextEffect !== null) {
        commitMutaitonEffectsOnFiber(nextEffect);
        const sibling: FiberNode | null = nextEffect.sibling
        if (sibling !== null) {
          nextEffect = sibling
          break up;
        }
        nextEffect = nextEffect.return
      }
    }
  }
}


function commitMutaitonEffectsOnFiber(finishedWork: FiberNode) {
  const flags = finishedWork.flags

  //这个fiberNode存在插入操作
  if ((flags & Placement) !== NoFlags) {
    commitPlacement(finishedWork)
    //将Placement从他的flags中移出
    finishedWork.flags &= ~Placement
  }

  //TODO Update ChildDeletion
}

function commitPlacement(finishedWork: FiberNode) {
  // parent 对应浏览器是 DOM
  if (__DEV__) {
    console.warn("执行Placement操作", finishedWork);
  }

  const hostParent = getHostParent(finishedWork)
  appendPlacementNodeIntoContainer(finishedWork, hostParent)
}

/**
 * 获取宿主环境的parent节点
*/
function getHostParent(fiber: FiberNode): Container {
  let parent = fiber.return
  while (parent) {
    const parentTag = parent.tag
    //HostComponent HostRoot
    if (parentTag === HostComponent) {
      return parent.stateNode as Container
    }

    if (parentTag === HostRoot) {
      return (parent.stateNode as FiberRootNode).container
    }

    parent = parent.return
  }

  if (__DEV__) {
    console.warn("未找到host parent");
  }
}

function appendPlacementNodeIntoContainer(finishedWork: FiberNode, hostParent: Container) {
  if (finishedWork.tag === HostComponent || finishedWork.tag === HostText) {
    appendChildToContainer(finishedWork.stateNode, hostParent)
  }
  const child = finishedWork.child

  if (child !== null) {
    appendPlacementNodeIntoContainer(child, hostParent)
    let sibling = child.sibling

    while (sibling !== null) {
      appendChildToContainer(sibling, hostParent)
      sibling = sibling.sibling
    }
  }
}
