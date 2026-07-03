import next from 'eslint-config-next';
import prettier from 'eslint-config-prettier';

/** ESLint flat config — Next.js 预设 + 关闭与 Prettier 冲突的格式规则。 */
const config = [
    ...next,
    prettier,
    {
        ignores: ['node_modules/**', '.next/**', 'out/**', 'specs/**', 'next-env.d.ts'],
    },
];

export default config;
