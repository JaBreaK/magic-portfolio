"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MangaListItem } from '@/types/api';
import { api } from '@/services/api';
import { MangaCard } from '@/components/MangaCard';
import { Grid, Flex, Button } from "@once-ui-system/core";
import { formatTimeAgo } from '@/utils/formatDate';

export const InfiniteMangaList = () => {
    const [activeTab, setActiveTab] = useState<'project' | 'mirror'>('project');
    const [mangaList, setMangaList] = useState<MangaListItem[]>([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const observer = useRef<IntersectionObserver | null>(null);

    const fetchManga = useCallback(async (reset = false) => {
        if (loading) return;
        setLoading(true);

        try {
            const currentPage = reset ? 1 : page;
            const response = await api.getMangaList({
                type: activeTab,
                page: currentPage,
                page_size: 24,
                is_update: true,
                sort: 'latest',
                sort_order: 'desc'
            });

            if (response.data && response.data.length > 0) {
                setMangaList(prev => reset ? response.data : [...prev, ...response.data]);
                setPage(prev => reset ? 2 : prev + 1);
                setHasMore(response.data.length === 24); // Assuming page_size is 24
            } else {
                setHasMore(false);
            }
        } catch (error) {
            console.error("Failed to fetch manga:", error);
        } finally {
            setLoading(false);
        }
    }, [activeTab, page, loading]);

    // Reset list when tab changes
    useEffect(() => {
        setMangaList([]);
        setPage(1);
        setHasMore(true);
        fetchManga(true);
    }, [activeTab]);

    // Infinite Scroll Observer
    const lastMangaElementRef = useCallback((node: HTMLDivElement) => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                fetchManga();
            }
        });

        if (node) observer.current.observe(node);
    }, [loading, hasMore, fetchManga]);

    return (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Tabs */}
            <div style={{ display: 'flex', gap: '16px', borderBottom: '1px solid var(--neutral-alpha-medium)', paddingBottom: '16px' }}>
                <button
                    onClick={() => setActiveTab('project')}
                    style={{
                        background: 'none',
                        border: 'none',
                        padding: '8px 16px',
                        fontSize: '18px',
                        fontWeight: activeTab === 'project' ? 700 : 500,
                        color: activeTab === 'project' ? 'var(--neutral-on-background-strong)' : 'var(--neutral-on-background-medium)',
                        cursor: 'pointer',
                        position: 'relative',
                        transition: 'all 0.3s'
                    }}
                >
                    Project
                    {activeTab === 'project' && (
                        <div style={{
                            position: 'absolute',
                            bottom: '-17px',
                            left: 0,
                            right: 0,
                            height: '2px',
                            backgroundColor: 'var(--brand-solid-strong)',
                            borderRadius: '2px'
                        }} />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('mirror')}
                    style={{
                        background: 'none',
                        border: 'none',
                        padding: '8px 16px',
                        fontSize: '18px',
                        fontWeight: activeTab === 'mirror' ? 700 : 500,
                        color: activeTab === 'mirror' ? 'var(--neutral-on-background-strong)' : 'var(--neutral-on-background-medium)',
                        cursor: 'pointer',
                        position: 'relative',
                        transition: 'all 0.3s'
                    }}
                >
                    Mirror
                    {activeTab === 'mirror' && (
                        <div style={{
                            position: 'absolute',
                            bottom: '-17px',
                            left: 0,
                            right: 0,
                            height: '2px',
                            backgroundColor: 'var(--brand-solid-strong)',
                            borderRadius: '2px'
                        }} />
                    )}
                </button>
            </div>

            {/* Grid */}
            <Grid style={{ gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))" }} gap="16">
                {mangaList.map((manga, index) => {
                    const renderMangaItem = (manga: MangaListItem) => (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <MangaCard manga={manga} />

                            {/* Latest Chapters */}
                            {manga.chapters && manga.chapters.length > 0 && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    {manga.chapters.slice(0, 3).map((chapter) => (
                                        <a
                                            key={chapter.chapter_id}
                                            href={`/chapter/${chapter.chapter_id}`}
                                            style={{
                                                textDecoration: 'none',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                fontSize: '12px',
                                                color: '#94a3b8',
                                                padding: '4px 8px',
                                                backgroundColor: 'rgba(255,255,255,0.03)',
                                                borderRadius: '6px',
                                                transition: 'all 0.2s'
                                            }}
                                            onMouseOver={(e) => {
                                                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)';
                                                e.currentTarget.style.color = '#e2e8f0';
                                            }}
                                            onMouseOut={(e) => {
                                                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)';
                                                e.currentTarget.style.color = '#94a3b8';
                                            }}
                                        >
                                            <span style={{ fontWeight: 500 }}>Ch. {chapter.chapter_number}</span>
                                            <span style={{ fontSize: '10px', opacity: 0.6 }}>
                                                {formatTimeAgo(chapter.created_at)}
                                            </span>
                                        </a>
                                    ))}
                                </div>
                            )}
                        </div>
                    );

                    if (mangaList.length === index + 1) {
                        return (
                            <div ref={lastMangaElementRef} key={`${manga.manga_id}-${index}`}>
                                {renderMangaItem(manga)}
                            </div>
                        );
                    } else {
                        return (
                            <div key={`${manga.manga_id}-${index}`}>
                                {renderMangaItem(manga)}
                            </div>
                        );
                    }
                })}
            </Grid>

            {loading && (
                <Flex fillWidth horizontal="center" padding="32">
                    <div className="loading-spinner" style={{
                        width: '40px',
                        height: '40px',
                        border: '4px solid rgba(255,255,255,0.1)',
                        borderLeftColor: '#3b82f6',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                    }}></div>
                    <style jsx>{`
                        @keyframes spin {
                            0% { transform: rotate(0deg); }
                            100% { transform: rotate(360deg); }
                        }
                    `}</style>
                </Flex>
            )}
        </div>
    );
};
