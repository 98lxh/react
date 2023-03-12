export type Flags = number

//表示当前没有标记
export const NoFlags = 0b00000001;
//表示插入标记
export const Placement = 0b00000010;
//表示更新标记
export const Update = 0b00000100;
//表示删除子节点标记
export const ChildDeletion = 0b00001000;


export const MutaitonMask = Placement | Update | ChildDeletion
