/*============================================================================
  search-bar - 导航页搜索栏

  提供搜索引擎切换、直达 HTTP(S) 网址与本地搜索历史。
============================================================================*/

"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { Icon } from "@/components/ui/icons";
import { NAV_SEARCH_ENGINES } from "@/features/nav/config";
import {
    clearNavSearchHistory,
    getNavSearchEngine,
    getNavSearchHistory,
    saveNavSearchEngine,
    saveNavSearchHistory,
} from "@/features/nav/lib/storage";
import { getNavHttpUrl } from "@/features/nav/lib/urls";
import { useClickOutside } from "@/hooks/use-click-outside";
import type { NavSearchHistoryItem } from "@/types/nav";

import styles from "./search-bar.module.css";

const DEFAULT_SEARCH_ENGINE = NAV_SEARCH_ENGINES[0];
const ENGINE_MENU_ID = "nav-search-engines";

function createHistoryId(): string {
    return crypto.randomUUID();
}

export function SearchBar() {
    const [engineKey, setEngineKey] = useState<string>(DEFAULT_SEARCH_ENGINE.key);
    const [history, setHistory] = useState<NavSearchHistoryItem[]>([]);
    const [isEngineMenuOpen, setIsEngineMenuOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [activeEngineIndex, setActiveEngineIndex] = useState(0);
    const engineMenuRef = useRef<HTMLDivElement>(null);
    const engineTriggerRef = useRef<HTMLButtonElement>(null);
    const engineItemRefs = useRef<(HTMLButtonElement | null)[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);
    const engine = NAV_SEARCH_ENGINES.find((item) => item.key === engineKey) ?? DEFAULT_SEARCH_ENGINE;

    useClickOutside(engineMenuRef, () => setIsEngineMenuOpen(false), { enabled: isEngineMenuOpen });

    useEffect(() => {
        const frame = requestAnimationFrame(() => {
            setEngineKey(getNavSearchEngine());
            setHistory(getNavSearchHistory());
        });

        return () => cancelAnimationFrame(frame);
    }, []);

    useEffect(() => {
        if (!isEngineMenuOpen) return;

        engineItemRefs.current[activeEngineIndex]?.focus();
    }, [activeEngineIndex, isEngineMenuOpen]);

    function openEngineMenu() {
        setActiveEngineIndex(NAV_SEARCH_ENGINES.findIndex((item) => item.key === engine.key));
        setIsEngineMenuOpen(true);
    }

    function closeEngineMenu(shouldRestoreFocus = false) {
        setIsEngineMenuOpen(false);

        if (shouldRestoreFocus) {
            requestAnimationFrame(() => engineTriggerRef.current?.focus());
        }
    }

    function handleSearch(searchQuery = query) {
        const value = searchQuery.trim();
        if (!value) return;

        const directUrl = getNavHttpUrl(value);
        const engineKeyForRecord = directUrl ? "direct" : engine.key;
        const nextHistory = [
            { engineKey: engineKeyForRecord, id: createHistoryId(), query: value, timestamp: Date.now() },
            ...history.filter((item) => item.query !== value),
        ];
        saveNavSearchHistory(nextHistory);
        setHistory(nextHistory);
        setQuery("");

        const url = directUrl ?? engine.searchUrl.replace("{query}", encodeURIComponent(value));
        window.open(url, "_blank", "noopener,noreferrer");
    }

    function handleEngineChange(nextEngineKey: string) {
        setEngineKey(nextEngineKey);
        saveNavSearchEngine(nextEngineKey);
        setIsEngineMenuOpen(false);
        inputRef.current?.focus();
    }

    function handleEngineMenuKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
        if (event.key === "Escape") {
            event.preventDefault();
            closeEngineMenu(true);
            return;
        }

        const lastIndex = NAV_SEARCH_ENGINES.length - 1;
        let nextIndex: number | null = null;

        if (event.key === "Home") nextIndex = 0;
        if (event.key === "End") nextIndex = lastIndex;
        if (event.key === "ArrowDown") nextIndex = (activeEngineIndex + 1) % NAV_SEARCH_ENGINES.length;
        if (event.key === "ArrowUp") nextIndex = (activeEngineIndex - 1 + NAV_SEARCH_ENGINES.length) % NAV_SEARCH_ENGINES.length;
        if (nextIndex === null) return;

        event.preventDefault();
        setActiveEngineIndex(nextIndex);
        engineItemRefs.current[nextIndex]?.focus();
    }

    function handleEngineMenuBlur(event: React.FocusEvent<HTMLDivElement>) {
        if (event.relatedTarget instanceof Node && engineMenuRef.current?.contains(event.relatedTarget)) return;

        closeEngineMenu();
    }

    function handleClearHistory() {
        clearNavSearchHistory();
        setHistory([]);
    }

    return (
        <div className={styles.root}>
            <form
                className={styles.form}
                onSubmit={(event) => {
                    event.preventDefault();
                    handleSearch();
                }}
            >
                <div className={styles.engine} ref={engineMenuRef}>
                    <button
                        aria-controls={ENGINE_MENU_ID}
                        aria-expanded={isEngineMenuOpen}
                        aria-haspopup="menu"
                        aria-label={`切换搜索引擎，当前为 ${engine.name}`}
                        onClick={() => (isEngineMenuOpen ? closeEngineMenu() : openEngineMenu())}
                        ref={engineTriggerRef}
                        type="button"
                    >
                        <Image alt="" height={20} src={engine.logo} width={20} />
                    </button>
                    {isEngineMenuOpen ? (
                        <div
                            aria-label="搜索引擎"
                            className={styles.engineMenu}
                            id={ENGINE_MENU_ID}
                            onBlur={handleEngineMenuBlur}
                            onKeyDown={handleEngineMenuKeyDown}
                            role="menu"
                        >
                            {NAV_SEARCH_ENGINES.map((item, index) => (
                                <button
                                    aria-checked={item.key === engine.key}
                                    className={item.key === engine.key ? styles.engineMenuItemActive : undefined}
                                    key={item.key}
                                    onClick={() => handleEngineChange(item.key)}
                                    onFocus={() => setActiveEngineIndex(index)}
                                    ref={(element) => {
                                        engineItemRefs.current[index] = element;
                                    }}
                                    role="menuitemradio"
                                    tabIndex={activeEngineIndex === index ? 0 : -1}
                                    type="button"
                                >
                                    <Image alt="" height={16} src={item.logo} width={16} />
                                    {item.name}
                                </button>
                            ))}
                        </div>
                    ) : null}
                </div>
                <input
                    aria-label="搜索关键词"
                    autoComplete="off"
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="寻找一处旧识，或抵达一方新境"
                    ref={inputRef}
                    type="search"
                    value={query}
                />
                <button aria-label="搜索" className={styles.submit} type="submit">
                    <Icon name="search" size="1rem" />
                </button>
            </form>

            {history.length ? (
                <section aria-label="最近搜索" className={styles.history}>
                    <div className={styles.historyHeader}>
                        <h2>最近搜索</h2>
                        <button onClick={handleClearHistory} type="button">
                            清除
                        </button>
                    </div>
                    <ul>
                        {history.map((item) => (
                            <li key={item.id}>
                                <button onClick={() => handleSearch(item.query)} type="button">
                                    {item.query}
                                </button>
                            </li>
                        ))}
                    </ul>
                </section>
            ) : null}
        </div>
    );
}
