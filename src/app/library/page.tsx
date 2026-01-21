"use client";

import React, { useEffect, useState } from 'react';
import { Column, Heading, Text, Flex, Grid, Button, Badge } from "@once-ui-system/core";
import { getBookmarks, getHistory, checkBookmarkUpdates, BookmarkItem, HistoryItem } from "@/utils/library";
import { downloadManager } from "@/services/downloadManager";
import { SmartImage, GenreTag } from "@/components";
import Link from 'next/link';
import { formatTimeAgo } from '@/utils/formatDate';

export default function LibraryPage() {
    const [activeTab, setActiveTab] = useState<'history' | 'bookmarks' | 'downloads'>('history');
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
    const [downloads, setDownloads] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            setHistory(getHistory());
            setBookmarks(getBookmarks());
            
            const allDownloads = await downloadManager.getAllDownloads();
            setDownloads(allDownloads);
            
            setLoading(false);

            // Check for updates for bookmarks
            const updated = await checkBookmarkUpdates();
            if (updated.length > 0) {
                setBookmarks(updated);
            }
        };
        loadData();
    }, []);

    return (
        <Column fillWidth paddingY="64" gap="32" horizontal="center" style={{ maxWidth: '100vw', overflowX: 'hidden' }}>
            <div style={{
                width: '100%',
                maxWidth: '1024px',
                padding: '0 16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '32px',
                alignItems: 'flex-start' // Ensure left alignment
            }}>
                <Heading variant="display-strong-m" style={{ textAlign: 'left' }}>My Library</Heading>

                {/* Tabs */}
                <Flex gap="16" borderBottom="neutral-alpha-weak" paddingBottom="16" horizontal="start" style={{ width: '100%' }}>
                    <Button
                        variant={activeTab === 'history' ? 'primary' : 'tertiary'}
                        onClick={() => setActiveTab('history')}
                    >
                        History
                    </Button>
                    <Button
                        variant={activeTab === 'bookmarks' ? 'primary' : 'tertiary'}
                        onClick={() => setActiveTab('bookmarks')}
                    >
                        Bookmarks
                        {bookmarks.some(b => b.hasUpdate) && (
                            <div style={{
                                marginLeft: '8px',
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                backgroundColor: '#ef4444' // red-500
                            }} />
                        )}
                    </Button>
                    <Button
                        variant={activeTab === 'downloads' ? 'primary' : 'tertiary'}
                        onClick={() => setActiveTab('downloads')}
                    >
                        Downloads
                    </Button>
                </Flex>

                {/* Content */}
                {loading ? (
                    <Text>Loading...</Text>
                ) : (
                    <Grid fillWidth style={{ gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", width: '100%' }} gap="16">
                        {activeTab === 'history' && history.map((item) => (
                            <Link key={`${item.mangaId}-${item.chapterId}`} href={`/chapter/${item.chapterId}`} style={{ textDecoration: 'none' }}>
                                <Column
                                    fillWidth
                                    background="surface"
                                    radius="m"
                                    overflow="hidden"
                                    style={{
                                        transition: 'transform 0.2s',
                                        cursor: 'pointer',
                                        height: '100%'
                                    }}
                                >
                                    <div style={{ position: 'relative', aspectRatio: '2/3' }}>
                                        <SmartImage
                                            src={item.coverUrl}
                                            alt={item.mangaTitle}
                                            aspectRatio="2/3"
                                            objectFit="cover"
                                        />
                                        <div style={{
                                            position: 'absolute',
                                            bottom: 0,
                                            left: 0,
                                            right: 0,
                                            padding: '8px',
                                            background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)'
                                        }}>
                                            <Text variant="body-default-xs" style={{ color: 'white' }}>
                                                Ch. {item.chapterNumber}
                                            </Text>
                                        </div>
                                    </div>
                                    <Column padding="12" gap="4">
                                        <Text variant="body-strong-s" style={{
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden'
                                        }}>
                                            {item.mangaTitle}
                                        </Text>
                                        <Text variant="body-default-xs" onBackground="neutral-weak">
                                            {formatTimeAgo(new Date(item.timestamp).toISOString())}
                                            {item.imageIndex !== undefined && item.imageIndex > 0 && ` • Page ${item.imageIndex + 1}`}
                                        </Text>
                                    </Column>
                                </Column>
                            </Link>
                        ))}

                        {activeTab === 'bookmarks' && bookmarks.map((item) => (
                            <Link key={item.mangaId} href={`/manga/${item.mangaId}`} style={{ textDecoration: 'none' }}>
                                <Column
                                    fillWidth
                                    background="surface"
                                    radius="m"
                                    overflow="hidden"
                                    style={{
                                        transition: 'transform 0.2s',
                                        cursor: 'pointer',
                                        height: '100%',
                                        border: item.hasUpdate ? '1px solid #3b82f6' : 'none'
                                    }}
                                >
                                    <div style={{ position: 'relative', aspectRatio: '2/3' }}>
                                        <SmartImage
                                            src={item.coverUrl}
                                            alt={item.title}
                                            aspectRatio="2/3"
                                            objectFit="cover"
                                        />
                                        {item.hasUpdate && (
                                            <div style={{
                                                position: 'absolute',
                                                top: '8px',
                                                right: '8px',
                                                backgroundColor: '#3b82f6',
                                                color: 'white',
                                                padding: '2px 8px',
                                                borderRadius: '999px',
                                                fontSize: '10px',
                                                fontWeight: 700
                                            }}>
                                                UP
                                            </div>
                                        )}
                                    </div>
                                    <Column padding="12" gap="4">
                                        <Text variant="body-strong-s" style={{
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden'
                                        }}>
                                            {item.title}
                                        </Text>
                                        <Text variant="body-default-xs" onBackground="neutral-weak">
                                            Latest: Ch. {item.latestChapterNumber}
                                        </Text>
                                    </Column>
                                </Column>
                            </Link>
                        ))}

                        {activeTab === 'downloads' && downloads.map((item) => (
                            <Link key={item.chapterId} href={`/chapter/${item.chapterId}`} style={{ textDecoration: 'none' }}>
                                <Column
                                    fillWidth
                                    background="surface"
                                    radius="m"
                                    overflow="hidden"
                                    style={{
                                        transition: 'transform 0.2s',
                                        cursor: 'pointer',
                                        height: '100%'
                                    }}
                                >
                                    <div style={{ position: 'relative', aspectRatio: '2/3' }}>
                                        <SmartImage
                                            src={item.coverUrl}
                                            alt={item.mangaTitle}
                                            aspectRatio="2/3"
                                            objectFit="cover"
                                        />
                                        <div style={{
                                            position: 'absolute',
                                            top: '8px',
                                            right: '8px',
                                            backgroundColor: '#10b981', // green-500
                                            color: 'white',
                                            padding: '4px',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="20 6 9 17 4 12"></polyline>
                                            </svg>
                                        </div>
                                        <div style={{
                                            position: 'absolute',
                                            bottom: 0,
                                            left: 0,
                                            right: 0,
                                            padding: '8px',
                                            background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)'
                                        }}>
                                            <Text variant="body-default-xs" style={{ color: 'white' }}>
                                                Ch. {item.chapterNumber}
                                            </Text>
                                        </div>
                                    </div>
                                    <Column padding="12" gap="4">
                                        <Text variant="body-strong-s" style={{
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden'
                                        }}>
                                            {item.mangaTitle}
                                        </Text>
                                        <Text variant="body-default-xs" onBackground="neutral-weak">
                                            Downloaded {formatTimeAgo(new Date(item.timestamp).toISOString())}
                                        </Text>
                                    </Column>
                                </Column>
                            </Link>
                        ))}
                    </Grid>
                )}

                {!loading && activeTab === 'history' && history.length === 0 && (
                    <Flex fillWidth horizontal="center">
                        <Text onBackground="neutral-weak">No history yet.</Text>
                    </Flex>
                )}
                {!loading && activeTab === 'bookmarks' && bookmarks.length === 0 && (
                    <Flex fillWidth horizontal="center">
                        <Text onBackground="neutral-weak">No bookmarks yet.</Text>
                    </Flex>
                )}
                {!loading && activeTab === 'downloads' && downloads.length === 0 && (
                    <Flex fillWidth horizontal="center">
                        <Text onBackground="neutral-weak">No downloads yet.</Text>
                    </Flex>
                )}
            </div>
        </Column>
    );
}
