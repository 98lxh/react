import path from 'path';
import fs from 'fs';

import ts from 'rollup-plugin-typescript2';
import cjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';


//包源码的base路径
const pkgPath = path.resolve(__dirname, '../../packages');
//打包后结果的base路径
const distPath = path.resolve(__dirname, '../../dist/node_modules');

/**
 * 获取包路径
 * @param pkgName 包名
 * @param isDist 是否为打包后的路径
 */
export function resolvePkgPath(pkgName, isDist) {
	if (isDist) {
		return `${distPath}/${pkgName}`;
	}

	return `${pkgPath}/${pkgName}`;
}

/**
 * 获取包的package.json
 * @param pkgName 包名
 */
export function getPackageJSON(pkgName) {
	const path = `${resolvePkgPath(pkgName)}/package.json`;
	const pkgStr = fs.readFileSync(path, { encoding: 'utf-8' });
	return JSON.parse(pkgStr);
}

/**
 * 获取rollup公用的插件
 * @param pkgName 包名
 */
export function getBaseRollupPlugin({ typescript = {}, alias={__DEV__:true} } = {}) {
	return [replace(alias),cjs(), ts(typescript)];
}
