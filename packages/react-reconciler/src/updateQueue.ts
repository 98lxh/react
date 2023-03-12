import { Action } from "shared/ReactTypes";

/* action对应两种方式 this.setState(state) || this.setState((prevState) => newSatet) **/
export interface Update<State> {
  action: Action<State>
}


export interface UpdateQueue<State> {
  shared: {
    pending: Update<State> | null
  }
}

/**
 * 更新对应的数据结构update
 * @param action
*/
export const createUpdate = <State>(action: Action<State>): Update<State> => {
  return {
    action
  }
}

/**
 * 保存对应的update的数据结构，updateQueue
*/
export const createUpdateQueue = <State>() => {
  return {
    shared: {
      pending: null
    }
  } as UpdateQueue<State>
}


/**
 * 将update插入到updateQueue中
 * @param updateQueue 
 * @param update 添加的update
 * 
*/
export const enqueueUpdate = <State>(
  updateQueue: UpdateQueue<State>,
  update: Update<State>
) => {
  updateQueue.shared.pending = update;
}


/****
 *消费update -> 基于一个基础的状态，以及一个pendingUpdate经过计算获得最终的状态memoizedState
 * @param baseState 初始的状态
 * @param pendingProps 要消费的update
*/
export const processUpdateQueue = <State>(
  baseState: State,
  pendingUpdate: Update<State> | null
): { memoizedState: State } => {
  const result: ReturnType<typeof processUpdateQueue<State>> = { memoizedState: baseState }

  if (pendingUpdate !== null) {
    const action = pendingUpdate.action
    if (action instanceof Function) {
      /*例2:baseState为1 -> update为(x) => 4x ->  memoizedState为 4 * 1 = 4 **/
      result.memoizedState = action(baseState)
    } else {
      /*例1:baseState为1 -> update为2 -> memoizedState为2 **/
      result.memoizedState = action
    }
  }

  return result
}
