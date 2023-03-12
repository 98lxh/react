import { REACT_ELEMENT_TYPE } from "shared/ReactSymbols";
import { ReactElementType } from "shared/ReactTypes";
import { createFiberFormElement, FiberNode } from "./fiber";
import { Placement } from "./fiberFlags";
import { HostText } from "./workTags";

/**
 * beginWork的优化策略构建成一棵「离屏DOM树」 执行一次操作
 * @param shouldTrackEffects 是否追踪副作用
*/
export function ChildrenReconciler(shouldTrackEffects: boolean) {

  /**
   * 根据element创建fiber并返回
   * @param returnFiber 父fiber
   * @param currentFiber 当前fiber
   * @param element ReactElement
  */
  function reconcileSingleElement(returnFiber: FiberNode, currentFiber: FiberNode | null, element: ReactElementType) {
    const fiber = createFiberFormElement(element)
    fiber.return = returnFiber
    return fiber
  }

  /**
 * 根据content创建文本节点fiber并返回
 * @param returnFiber 父fiber
 * @param currentFiber 当前fiber
 * @param content 文本节点的内容
*/
  function reconcileSingleTextNode(returnFiber: FiberNode, currentFiber: FiberNode | null, content: string | number) {
    const fiber = new FiberNode(HostText, { content }, null)
    fiber.return = returnFiber
    return fiber
  }

  /**
   * 插入单一的节点
  */
  function placeSingleChild(fiber: FiberNode) {
    /* 需要追踪作用 & 首屏渲染 **/
    if (shouldTrackEffects && fiber.alternate === null) {
      fiber.flags |= Placement
    }
    return fiber
  }


  /**
   * @param returnFiber 父fiber
   * @param currentFiber 当前fiber 
   * @param newChild 子节点
  */
  return function reconcileChildFibers(returnFiber: FiberNode, currentFiber: FiberNode | null, newChild: ReactElementType | null) {
    //判断当前fiber的类型
    if (typeof newChild === 'object' && newChild !== null) {
      switch (newChild.$$typeof) {
        case REACT_ELEMENT_TYPE:
          return placeSingleChild(reconcileSingleElement(returnFiber, currentFiber, newChild))
        default:
          if (__DEV__) {
            console.warn("未实现的reconcile类型", newChild)
          }
          break
      }
    }

    //TODO: 多节点的情况 ul > li*3

    //HostText
    if (typeof newChild === 'string' || typeof newChild === 'number') {
      return placeSingleChild(reconcileSingleTextNode(returnFiber, currentFiber, newChild))
    }

    if (__DEV__) {
      console.warn("未实现的reconcile类型", newChild)
    }

    return null
  }
}


export const reconcileChildFibers = ChildrenReconciler(true)
export const mountChildChildFibers = ChildrenReconciler(false)
