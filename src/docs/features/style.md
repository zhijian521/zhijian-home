# 样式与主题

知简 v2 的视觉基础由 `tokens.css + theme.css + CSS Modules` 组成。目标不是做一套复杂设计系统，而是让全站在迁移过程中始终保持变量统一、视觉稳定、便于后续调整。

## 三层结构

从上到下分三层：

| 层 | 文件 | 作用 |
|---|---|---|
| token | `src/app/tokens.css` | 间距、字号、行高、圆角 |
| theme | `src/app/theme.css` | 颜色、字体、阴影、焦点、过渡 |
| module | 各模块 CSS Module | 模块局部差异变量 |

`globals.css` 顶部导入顺序固定：

```css
@import './tokens.css';
@import './theme.css';
```

## 当前 token

### spacing

`--space-1` 到 `--space-8`，对应：

- `--space-1`: 4px
- `--space-2`: 8px
- `--space-3`: 12px
- `--space-4`: 16px
- `--space-5`: 24px
- `--space-6`: 32px
- `--space-7`: 48px
- `--space-8`: 64px

### text

字号变量为：

- `--text-xs`
- `--text-sm`
- `--text-base`
- `--text-lg`
- `--text-xl`
- `--text-2xl`
- `--text-3xl`

注意：当前正确变量名是 `--text-base`，不是 `--text-md`。

### line-height

- `--leading-tight`
- `--leading-normal`
- `--leading-relaxed`

### radius

- `--radius-none`
- `--radius-sm`
- `--radius`
- `--radius-md`
- `--radius-lg`

## 主题语义

`theme.css` 负责所有语义色和主题变量。常用变量包括：

- 文本：`--foreground` `--muted-foreground`
- 主色：`--primary` `--primary-foreground` `--primary-hover` `--primary-active`
- 语义色：`--success` `--warning` `--info` `--destructive`
- 背景：`--background` `--highlight` `--muted` `--secondary`
- 边框：`--border` `--border-strong` `--input`
- 浮层：`--card` `--popover` `--overlay`
- 阴影：`--shadow-sm` `--shadow` `--shadow-lg`
- 焦点：`--focus-outline` `--focus-offset`

注意：当前正文颜色变量是 `--foreground`，不是 `--text-primary`。

## 使用方式

推荐写法：

```css
.button {
    padding: var(--space-2) var(--space-4);
    font-size: var(--text-sm);
    line-height: var(--leading-normal);
    color: var(--primary-foreground);
    background: var(--primary);
    border-radius: var(--radius-none);
    box-shadow: var(--shadow-sm);
    transition: background var(--transition-fast);
}

.button:hover {
    background: var(--primary-hover);
}

.button:focus-visible {
    outline: var(--focus-outline);
    outline-offset: var(--focus-offset);
}
```

## 禁止项

禁止直接写：

- `padding: 12px`
- `font-size: 14px`
- `color: #333`

也不要在 `tokens.css` 里放颜色变量。

## 模块变量

如果某个模块需要和全局不同的局部变量，在模块根容器里声明：

```css
.navRoot {
    --nav-bg: var(--secondary);
    --nav-gap: var(--space-2);
    background: var(--nav-bg);
    gap: var(--nav-gap);
}
```

子组件只读取模块变量，不回写全局 `:root`。

## 暗色主题

暗色主题通过 `theme.css` 中的 `@media (prefers-color-scheme: dark)` 覆盖变量实现，不引入额外 JS。组件本身只读变量，不自己写一套重复的深浅色规则。
