import { Container } from "hostConfig";
import { ReactElementType } from "shared/ReactTypes";
import { FiberNode, FiberRootNode } from "./fiber";
import { createUpdate, createUpdateQueue, enqueueUpdate, UpdateQueue } from "./updateQueue";
import { scheduleUpdateOnFiber } from "./workLoop";
import { HostRoot } from "./workTags";

/**
 * 创建整个应用的根节点(fiberRootNode) 并将fiberRootNode与hostRootNode连接起来
 * 
 * 执行ReactDOM.createRoot().render
 * createRoot内部就会执行createContainer
 * @param container 容器
*/
export function createContainer(container: Container) {
  const hostRootFiber = new FiberNode(HostRoot, {}, null)
  const root = new FiberRootNode(container, hostRootFiber)
  hostRootFiber.updateQueue = createUpdateQueue();
  return root
}

/**
 * 创建update，并将update enqueue到 updateQueue中
 * 
 * 执行ReactDOM.createRoot().render
 * render内部就会执行updateContainer
*/
export function updateContainer(element: ReactElementType | null, root: FiberRootNode) {
  const hostRootFiber = root.current
  const update = createUpdate<ReactElementType | null>(element)
  enqueueUpdate(hostRootFiber.updateQueue as UpdateQueue<ReactElementType | null>, update)
  /* 当把update插入到updateQueue中后就开始执行scheduleUpdateOnFiber进行调度 **/
  scheduleUpdateOnFiber(hostRootFiber)
  return element
}
