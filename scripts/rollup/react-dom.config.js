import { getBaseRollupPlugin, getPackageJSON, resolvePkgPath } from './utils';
import generatePackageJson from 'rollup-plugin-generate-package-json';
import alias from '@rollup/plugin-alias';

const { name, module } = getPackageJSON('react-dom');

//react-dom包路径
const pkgPath = resolvePkgPath(name);
//react-dom产出路径
const pkgDistPath = resolvePkgPath(name, true);

export default [
	/**
	 * react-dom
	 */
	{
		input: `${pkgPath}/${module}`,
		output: [
      {
        file: `${pkgDistPath}/index.js`,
        name: 'index.js',
        format: 'umd'
      },
      {
        file: `${pkgDistPath}/client.js`,
        name: 'index.js',
        format: 'umd'
      }
    ],
		plugins: [
			...getBaseRollupPlugin(),
      alias({
        /* 类似webpack中的 resolve alias 将hostConfig指向react-dom的hostCOnfig **/
        entries:{
          'hostConfig':`${pkgPath}/src/hostConfig.ts`
        }
      }),
			generatePackageJson({
				inputFolder: pkgPath,
				outputFolder: pkgDistPath,
				baseContents: ({ name, dependencies, version }) => ({
					name,
					version,
					dependencies,
          peerDependencies:{
            'react':version
          },
					main: 'index.js'
				})
			})
		]
	}
];
