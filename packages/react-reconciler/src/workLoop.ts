import { beginWork } from "./beginWork";
import { commitMutaitonEffects } from "./commitWork";
import { completeWork } from "./completeWork";
import { createWorkInProgress, FiberNode, FiberRootNode } from "./fiber";
import { MutaitonMask, NoFlags } from "./fiberFlags";
import { HostRoot } from "./workTags";

//当前正在工作的FiberNode
let workInProgress: FiberNode | null = null

function perpareRefreshStack(root: FiberRootNode) {
  /* 这里的fiberRoot并不是一个普通的fiber 不能拿来直接到workInProgress来使用 **/
  /* 根据fiberRoot的current也就是hostRootFiber生成一个workInProgress **/
  workInProgress = createWorkInProgress(root.current, {})
}

/* 在fiber中调度update **/
export function scheduleUpdateOnFiber(fiber: FiberNode) {
  //TODO 调度流程
  /** 对于首屏渲染，传入的fiber就是hostRootFiber */
  /** 对于其他流程，传入的component对应的fiber */
  const root = markUpdateFormFiberRoot(fiber) // -> fiberRoot
  renderRoot(root);
}

/* 递归到fiber的根节点 **/
function markUpdateFormFiberRoot(fiber: FiberNode) {
  let node = fiber;
  let parent = node.return;

  while (parent !== null) {
    /** 存在父节点，也就是没有到达根节点，将当前节点赋值为父节点,将父节点赋值为当前节点父节点的父节点。 */
    node = parent;
    parent = parent.return
  }

  //找到tag为HostRoot的根节点
  if (node.tag === HostRoot) {
    return node.stateNode
  }

  return null
}

export function renderRoot(root: FiberRootNode) {
  //初始化 -> 这里是将fiberRoot转换为普通的fiber并将其设置为workInProgresss
  perpareRefreshStack(root)
  do {
    try {
      workLoop()
      break;
    } catch (e) {
      if (__DEV__) {
        console.warn("workLoop发生错误", e);
      }
      workInProgress = null;
    }

  } while (true)

  /**
   * root
   * -> fiberRootNode对应的current指向的是hostRootFiber 
   * -> alternate对应整个更新开始时候perpareRefreshStack执行createWorkInProgress创建的hostRootFiber 对应的 workInProgress Fiber
  */
  const finishedWork = root.current.alternate
  root.finishedWork = finishedWork

  /* workInProgress fiberNode树 根据树中的flags 执行具体的操作(浏览器的dom操作) **/
  commitRoot(root)
}

function workLoop() {
  while (workInProgress !== null) {
    performUnitOfWork(workInProgress)
  }
}

function commitRoot(root: FiberRootNode) {
  const finishedWork = root.finishedWork
  if (finishedWork === null) {
    return
  }

  if (__DEV__) {
    console.warn("commit阶段开始", finishedWork);
  }
  //重置
  root.finishedWork = null

  //判断是否存在三个子节点需要执行的操作
  //判断root本身的flags 和 root的subtreeFlags
  const subtreeHasEffect = (finishedWork.subtreeFlags & MutaitonMask) !== NoFlags
  const rootHasEffect = (finishedWork.flags & MutaitonMask) !== NoFlags
  if (subtreeHasEffect || rootHasEffect) {
    /* beforeMutaiton阶段 **/
    /* mutaiton阶段 **/
    commitMutaitonEffects(finishedWork)
    root.current = finishedWork
    /* layout阶段 **/
  } else {
    //没有任何副作用
    root.current = finishedWork
  }

}

/**
 * 为传入的workInProgress生成下一个fiber,不断的循环调用，直到把宿友的fiber都生成并连接诚fiber树位置
 * @param fiber workInProgress
*/
function performUnitOfWork(fiber: FiberNode) {
  //开始工作
  //获取wip.child -> 子节点
  const next = beginWork(fiber);
  //工作完成将最终的props设置为计算后的props
  fiber.memoizedProps = fiber.pendingProps;

  if (next === null) {
    //没有子Fiber(深度优先的最深层),进入归阶段
    completeUnitWork(fiber)
  } else {
    //有子节点(没有到达最深层) -> 工作中的节点改变为next
    workInProgress = next
  }
}


function completeUnitWork(fiber: FiberNode) {
  //遍历兄弟节点
  let node: FiberNode | null = fiber;
  do {
    completeWork(node);
    const sibling = node.sibling;
    //有兄弟节点
    if (sibling) {
      workInProgress = sibling
      return
    }

    node = node.return
    workInProgress = node
  } while (node !== null);
}
