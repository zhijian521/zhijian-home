# 04 · API 规范

## 统一响应结构

所有 API Route 返回的 JSON 一律遵循([core/api-response.ts](../src/lib/core/api-response.ts)):

```
成功: { code: 0,    data: T,    message: "操作成功" }
失败: { code: xxx,  data: null, message: "错误描述" }
```

- HTTP 状态码保留语义(200/201/400/401/403/404/409/500)。
- `body.code` 承载业务错误码,前端按 code 精确处理,不靠 message。
- 用 `success(data)` / `fail(code, message)` 构造,不手写对象。

## 业务错误码

`BizCode` 常量对象,按区段分配。新增错误码加在对应区段,不复用既有码:

```
SUCCESS     0
通用         40000 / 40100 / 40300 / 40400 / 40900 / 50000
用户         40401 / 40301 / 40901 / 40001
分类         40402 / 40902
标签         40403 / 40903
上传         40404 / 40002 / 40003
```

约定:`4xxN` 中 `4xx` 对齐 HTTP 区段,末位 `N` 是该区段内细分。

## 鉴权包装

三个包装器([core/with-admin.ts](../src/lib/core/with-admin.ts)、[core/with-user.ts](../src/lib/core/with-user.ts)),消除每个 route 重复的鉴权样板:

```ts
// 后台接口:必须管理员
export const GET = withAdmin(async (request, admin) => {
  const data = await listPosts();
  return NextResponse.json(success(data));
});

// 需登录用户(不限角色)
export const GET = withUser(async (request, user) => { ... });

// 公开接口:不包,直接写,但响应仍走 success/fail
export async function GET() {
  return NextResponse.json(success(await listPublishedPosts()));
}
```

- `withAdmin` 鉴权失败返回 403 + `fail(FORBIDDEN, '需要管理员权限。')`。
- `withUser` 失败返回 401 + `fail(UNAUTHORIZED, '未登录。')`。
- handler 第三参是 Next 15 的 `context: { params: Promise<...> }`,需要路由参数时 `await context.params`。

**禁止**:route 内自己写 `requireAdminFromRequest` + 手动 403。一律走包装器。

## Route 注释规范

每个 `route.ts` 顶部写标准 JSDoc,供接口文档 registry 提炼:

```ts
/**
 * @api 文章列表
 * @group posts
 * @auth none
 * @method GET  返回全部已发布文章
 * @method POST 创建草稿(需 admin)
 * @returns success<Post[]> | fail
 */
```

| 字段 | 含义 |
|---|---|
| `@api` | 接口名称(中文) |
| `@group` | 分组:posts / nav / auth / admin / ai / collect |
| `@auth` | 鉴权:none / user / admin |
| `@method` | 每个方法一行:方法 + 说明 |
| `@returns` | 响应形式 |

改接口时顺手改注释——注释在代码旁,成本极低。

## 接口索引 registry

`src/docs/api/_registry.ts` 手写登记每个接口的路径 + 元信息(从注释提炼):

```ts
export interface ApiEntry {
  path: string;                              // /api/admin/posts
  name: string;                              // 文章列表
  group: string;                             // posts / nav / auth / admin / ai / collect
  auth: 'none' | 'user' | 'admin';
  methods: { method: string; desc: string }[];
}
export const API_REGISTRY: ApiEntry[] = [ /* ... */ ];
```

33 个接口分 6 组:`posts`(公开)、`admin/*`(后台,含 posts/categories/tags/uploads/users/analytics/seo)、`nav/*`、`auth/*`、`ai/*`、`collect`(统计采集)。

registry 与磁盘一致性由 `docs:check` 校验,见 [07](./07-文档与校验.md)。

## 错误处理

- 业务校验失败:返回 `fail(BizCode.XXX, '中文说明')` + 对应 HTTP 状态。
- 意外异常:catch 后返回 `fail(BizCode.INTERNAL, '服务器错误')` + 500,不向前端泄露堆栈。
- 入参校验在信任边界做:route 入口处校验,通过后才进 domain。

## 分页

列表接口 `data` 用 `ListData<T>`:`{ data: T[]; total: number }`。
