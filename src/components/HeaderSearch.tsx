"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@once-ui-system/core'; // Assuming Icon wrapper exists or use direct react-icons
import { HiMagnifyingGlass } from "react-icons/hi2";
import { api } from '@/services/api';
import { MangaListItem } from '@/types/api';
import styles from './HeaderSearch.module.scss';
import { SmartImage } from './SmartImage';

// Debounce helper
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

export const HeaderSearch = () => {
    const router = useRouter();
    const [isExpanded, setIsExpanded] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<MangaListItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);

    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const debouncedQuery = useDebounce(query, 300);

    // Handle click outside to collapse
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsExpanded(false);
                setQuery(''); // Optional: clear query on collapse
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Focus input when expanded
    useEffect(() => {
        if (isExpanded && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isExpanded]);

    // Fetch results when debounced query changes
    useEffect(() => {
        const fetchResults = async () => {
            if (debouncedQuery.trim().length === 0) {
                setResults([]);
                return;
            }

            setIsLoading(true);
            try {
                const response = await api.getMangaList({
                    q: debouncedQuery,
                    page_size: 5
                });
                setResults(response.data || []);
            } catch (error) {
                console.error("Search error:", error);
                setResults([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchResults();
    }, [debouncedQuery]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            setIsExpanded(false);
            inputRef.current?.blur();
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => (prev > -1 ? prev - 1 : prev));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (selectedIndex >= 0 && results[selectedIndex]) {
                handleSelect(results[selectedIndex]);
            } else {
                handleSubmit();
            }
        }
    };

    const handleSubmit = () => {
        if (query.trim()) {
            router.push(`/search?q=${encodeURIComponent(query)}`);
            setIsExpanded(false);
            setQuery('');
        }
    };

    const handleSelect = (manga: MangaListItem) => {
        router.push(`/manga/${manga.manga_id}`);
        setIsExpanded(false);
        setQuery('');
    };

    const toggleSearch = () => {
        setIsExpanded(true);
    };

    return (
        <div
            ref={containerRef}
            className={`${styles.searchContainer} ${isExpanded ? styles.expanded : styles.collapsed}`}
            onClick={!isExpanded ? toggleSearch : undefined}
        >
            <div className={styles.pill}>
                <div className={styles.inputWrapper}>
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Search manga..."
                        aria-label="Search"
                    />
                </div>
                <div className={styles.searchIcon} onClick={isExpanded ? handleSubmit : undefined}>
                    <HiMagnifyingGlass size={20} />
                </div>
            </div>

            {isExpanded && query.trim().length > 0 && (
                <div className={styles.dropdown} role="listbox">
                    {isLoading ? (
                        <div className={styles.loadingState}>Searching...</div>
                    ) : results.length > 0 ? (
                        <>
                            {results.map((manga, index) => (
                                <div
                                    key={manga.manga_id}
                                    className={`${styles.dropdownItem} ${index === selectedIndex ? styles.active : ''}`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleSelect(manga);
                                    }}
                                    onMouseEnter={() => setSelectedIndex(index)}
                                    role="option"
                                    aria-selected={index === selectedIndex}
                                >
                                    <SmartImage
                                        src={manga.cover_image_url}
                                        alt={manga.title}
                                        className={styles.thumbnail}
                                        aspectRatio="2/3"
                                    />
                                    <div className={styles.info}>
                                        <span className={styles.title}>{manga.title}</span>
                                        <div className={styles.meta}>
                                            <span>{manga.release_year}</span>
                                            <span>•</span>
                                            <span>{manga.status === 1 ? 'Ongoing' : 'Completed'}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div
                                className={styles.dropdownItem}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleSubmit();
                                }}
                            >
                                <span style={{ fontSize: '12px', color: 'var(--brand-solid-strong)', width: '100%', textAlign: 'center' }}>
                                    View all results for "{query}"
                                </span>
                            </div>
                        </>
                    ) : (
                        <div className={styles.emptyState}>No results found</div>
                    )}
                </div>
            )}
        </div>
    );
};
