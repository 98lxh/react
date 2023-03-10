export type Type = any;
export type Key = any;
export type Ref = any;
export type Props = any;
export type ElementType = any;

export interface ReactElementType {
	$$typeof: symbol | number;
	__mark: string;
	type: ElementType;
	props: Props;
	key: Key;
	ref: Ref;
}


export type Action<State> = State | ((pervState: State) => State)
