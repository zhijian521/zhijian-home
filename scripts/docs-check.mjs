// =============================================================================
// docs-check — 校验文档与 registry 是否一致
//
// 规则：
// 1. DOC_REGISTRY 中的 path -> src/docs/features/*.md 必须存在
// 2. 磁盘上的 src/docs/features/*.md 必须全部登记到 DOC_REGISTRY
// 3. 只要 src/app/api/**/route.ts 已经存在，就必须有 src/docs/api/_registry.ts
// 4. 如果 API_REGISTRY 存在，其中每个 path 都必须映射到真实 route.ts
//
// 只用 Node stdlib。退出码非 0 表示校验失败。
// =============================================================================

import { readdir, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const FEATURES_DIR = path.join(ROOT, 'src', 'docs', 'features');
const FEATURES_REGISTRY = path.join(FEATURES_DIR, '_registry.ts');
const API_REGISTRY = path.join(ROOT, 'src', 'docs', 'api', '_registry.ts');
const API_ROUTES_DIR = path.join(ROOT, 'src', 'app', 'api');

let failures = 0;

function fail(message) {
    console.error(`  x ${message}`);
    failures++;
}

function extractPaths(content) {
    const paths = [];
    const regex = /path\s*:\s*['"]([^'"]+)['"]/g;
    let match;

    while ((match = regex.exec(content)) !== null) {
        paths.push(match[1]);
    }

    return paths;
}

async function listFeatureMds() {
    if (!existsSync(FEATURES_DIR)) return [];

    const entries = await readdir(FEATURES_DIR, { withFileTypes: true });
    return entries
        .filter(entry => entry.isFile() && entry.name.endsWith('.md'))
        .map(entry => entry.name);
}

async function listApiRouteFiles(dir) {
    if (!existsSync(dir)) return [];

    const entries = await readdir(dir, { withFileTypes: true });
    const files = [];

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            files.push(...(await listApiRouteFiles(fullPath)));
            continue;
        }

        if (entry.isFile() && entry.name === 'route.ts') {
            files.push(fullPath);
        }
    }

    return files;
}

async function checkFeatures() {
    console.log('> 功能文档 registry');

    if (!existsSync(FEATURES_REGISTRY)) {
        fail(`缺少 ${path.relative(ROOT, FEATURES_REGISTRY)}`);
        return;
    }

    const content = await readFile(FEATURES_REGISTRY, 'utf8');
    const registered = extractPaths(content);
    const onDisk = await listFeatureMds();

    for (const featurePath of registered) {
        const fullPath = path.join(FEATURES_DIR, featurePath);
        if (!existsSync(fullPath)) {
            fail(`DOC_REGISTRY 登记的 "${featurePath}" 不存在`);
        }
    }

    for (const fileName of onDisk) {
        if (!registered.includes(fileName)) {
            fail(`磁盘上的 "${fileName}" 未登记到 DOC_REGISTRY`);
        }
    }
}

async function checkApi() {
    console.log('> 接口文档 registry');

    const routeFiles = await listApiRouteFiles(API_ROUTES_DIR);
    const hasApiRoutes = routeFiles.length > 0;

    if (hasApiRoutes && !existsSync(API_REGISTRY)) {
        fail(`已存在 API Route，但缺少 ${path.relative(ROOT, API_REGISTRY)}`);
        return;
    }

    if (!existsSync(API_REGISTRY)) {
        console.log('  (当前尚无 API_REGISTRY，且仓库里还没有 API Route，跳过)');
        return;
    }

    const content = await readFile(API_REGISTRY, 'utf8');
    const paths = extractPaths(content);

    for (const apiPath of paths) {
        const rel = apiPath.replace(/^\/api/, 'api');
        const routeFile = path.join(ROOT, 'src', 'app', rel, 'route.ts');

        if (!existsSync(routeFile)) {
            fail(`API_REGISTRY 中的 "${apiPath}" 映射不到 ${path.relative(ROOT, routeFile)}`);
        }
    }
}

async function main() {
    console.log('docs:check — 校验文档与 registry 一致性\n');

    await checkFeatures();
    await checkApi();

    console.log('');

    if (failures === 0) {
        console.log('OK 全部通过');
        process.exit(0);
    }

    console.error(`FAILED 共 ${failures} 项不一致`);
    process.exit(1);
}

main().catch(error => {
    console.error(error);
    process.exit(1);
});
