import { REACT_ELEMENT_TYPE } from 'shared/ReactSymbols';
import {
	Key,
	Ref,
	Type,
	Props,
	ElementType,
	ReactElementType
} from 'shared/ReactTypes';

const ReactElement = function (
	type: Type,
	key: Key,
	ref: Ref,
	props: Props
): ReactElementType {
	const element = {
		$$typeof: REACT_ELEMENT_TYPE,
		__mark: '_mark_',
		props,
		type,
		key,
		ref
	};

	return element;
};

/**
 * @param type 节点类型
 * @param config 节点的prop 包含key、ref...
 * @param maybeChildren 子节点集合
 */
export const jsx = (
	type: ElementType,
	config: any,
	...maybeChildren: any[]
) => {
	let key: Key = null;
	let ref: Ref = null;
	const props: Props = {};

	for (const prop in config) {
		const value = config[prop];
		//处理key
		if (prop === 'key') {
			if (value !== undefined) {
				key = '' + key;
			}
			continue;
		}

		//处理ref
		if (prop === 'ref') {
			if (value !== undefined) {
				ref = value;
			}
			continue;
		}

		//判断是否为confih自己的属性而不是原型上的，赋值自身的到orops
		if ({}.hasOwnProperty.call(config, prop)) {
			props[prop] = value;
		}

		const maybeChildrenLength = maybeChildren.length;

		//如果子节点不为空
		if (maybeChildrenLength) {
			if (maybeChildrenLength === 1) {
				//如果只有一个子节点可以直接复制给当前节点的children => [children]
				props.children = maybeChildren[0];
			} else {
				//如果有多个children => [children,children,children]
				props.children = maybeChildren;
			}
		}
	}

	return ReactElement(type, key, ref, props);
};

export const jsxDEV = (type: ElementType, config: any) => {
	let key: Key = null;
	let ref: Ref = null;
	const props: Props = {};

	for (const prop in config) {
		const value = config[prop];
		//处理key
		if (prop === 'key') {
			if (value !== undefined) {
				key = '' + key;
			}
			continue;
		}

		//处理ref
		if (prop === 'ref') {
			if (value !== undefined) {
				ref = value;
			}
			continue;
		}

		//判断是否为confih自己的属性而不是原型上的，赋值自身的到orops
		if ({}.hasOwnProperty.call(config, prop)) {
			props[prop] = value;
		}
	}

	return ReactElement(type, key, ref, props);
};
