"use client";

import { useState, useEffect } from "react";
import { Column, Text, Flex, Button, IconButton } from "@once-ui-system/core";
import { ChapterListItem, MangaDetail } from "@/types/api";
import { downloadManager } from "@/services/downloadManager";
import { api } from "@/services/api";
import Link from "next/link";
import { HiArrowDownTray, HiCheck, HiTrash } from "react-icons/hi2";

interface ChapterListProps {
    chapters: ChapterListItem[];
    mangaId: string;
}

export const ChapterList = ({ chapters, mangaId }: ChapterListProps) => {
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedChapters, setSelectedChapters] = useState<Set<string>>(new Set());
    const [downloadedChapters, setDownloadedChapters] = useState<Set<string>>(new Set());
    const [isDownloading, setIsDownloading] = useState(false);
    const [downloadProgress, setDownloadProgress] = useState<{ current: number; total: number } | null>(null);
    const [mangaDetail, setMangaDetail] = useState<MangaDetail | null>(null);

    useEffect(() => {
        checkDownloads();
        fetchMangaDetail();
    }, [mangaId]);

    const fetchMangaDetail = async () => {
        try {
            const res = await api.getMangaDetail(mangaId);
            setMangaDetail(res.data);
        } catch (error) {
            console.error("Failed to fetch manga detail for downloads", error);
        }
    };

    const checkDownloads = async () => {
        const downloads = await downloadManager.getDownloadsByManga(mangaId);
        const downloadedIds = new Set(downloads.map(d => d.chapterId));
        setDownloadedChapters(downloadedIds);
    };

    const toggleSelectionMode = () => {
        setIsSelectionMode(!isSelectionMode);
        setSelectedChapters(new Set());
    };

    const toggleChapterSelection = (chapterId: string) => {
        const newSelected = new Set(selectedChapters);
        if (newSelected.has(chapterId)) {
            newSelected.delete(chapterId);
        } else {
            newSelected.add(chapterId);
        }
        setSelectedChapters(newSelected);
    };

    const selectAll = () => {
        if (selectedChapters.size === chapters.length) {
            setSelectedChapters(new Set());
        } else {
            setSelectedChapters(new Set(chapters.map(c => c.chapter_id)));
        }
    };

    const handleBulkDownload = async () => {
        if (!mangaDetail || selectedChapters.size === 0) return;

        setIsDownloading(true);
        setDownloadProgress({ current: 0, total: selectedChapters.size });

        const chaptersToDownload = Array.from(selectedChapters);
        let completed = 0;

        for (const chapterId of chaptersToDownload) {
            try {
                // Skip if already downloaded
                if (downloadedChapters.has(chapterId)) {
                    completed++;
                    setDownloadProgress({ current: completed, total: selectedChapters.size });
                    continue;
                }

                await downloadManager.downloadChapterById(chapterId, mangaDetail);

                // Update local state
                setDownloadedChapters(prev => new Set(prev).add(chapterId));
                completed++;
                setDownloadProgress({ current: completed, total: selectedChapters.size });
            } catch (error) {
                console.error(`Failed to download chapter ${chapterId}`, error);
            }
        }

        setIsDownloading(false);
        setDownloadProgress(null);
        setIsSelectionMode(false);
        setSelectedChapters(new Set());
    };

    const handleSingleDownload = async (chapterId: string) => {
        if (!mangaDetail) return;

        try {
            await downloadManager.downloadChapterById(chapterId, mangaDetail);
            setDownloadedChapters(prev => new Set(prev).add(chapterId));
        } catch (error) {
            console.error("Download failed", error);
        }
    };

    return (
        <Column fillWidth gap="16">
            <Flex fillWidth horizontal="between" vertical="center">
                <Text variant="body-default-s" onBackground="neutral-weak">
                    {chapters.length} Chapters
                </Text>
                <Flex gap="8">
                    {isSelectionMode ? (
                        <>
                            <Button variant="tertiary" size="s" onClick={selectAll}>
                                {selectedChapters.size === chapters.length ? "Deselect All" : "Select All"}
                            </Button>
                            <Button
                                variant="primary"
                                size="s"
                                onClick={handleBulkDownload}
                                loading={isDownloading}
                                disabled={selectedChapters.size === 0}
                            >
                                {isDownloading
                                    ? `Downloading ${downloadProgress?.current}/${downloadProgress?.total}`
                                    : `Download (${selectedChapters.size})`}
                            </Button>
                            <Button variant="secondary" size="s" onClick={toggleSelectionMode} disabled={isDownloading}>
                                Cancel
                            </Button>
                        </>
                    ) : (
                        <Button variant="secondary" size="s" onClick={toggleSelectionMode} prefixIcon="download">
                            Bulk Download
                        </Button>
                    )}
                </Flex>
            </Flex>

            <Column fillWidth gap="8">
                {chapters.map((chapter) => (
                    <Flex
                        key={chapter.chapter_id}
                        fillWidth
                        padding="12"
                        background="surface"
                        border="neutral-medium"
                        radius="m"
                        vertical="center"
                        horizontal="between"
                        className="hover-highlight"
                        gap="16"
                    >
                        {isSelectionMode && (
                            <div onClick={() => toggleChapterSelection(chapter.chapter_id)} style={{ cursor: 'pointer' }}>
                                <div style={{
                                    width: '20px',
                                    height: '20px',
                                    borderRadius: '4px',
                                    border: '2px solid var(--neutral-border-strong)',
                                    backgroundColor: selectedChapters.has(chapter.chapter_id) ? 'var(--brand-solid-strong)' : 'transparent',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    {selectedChapters.has(chapter.chapter_id) && <HiCheck color="white" size={14} />}
                                </div>
                            </div>
                        )}

                        <Link
                            href={`/chapter/${chapter.chapter_id}`}
                            style={{ textDecoration: 'none', flex: 1 }}
                        >
                            <Column>
                                <Text variant="body-strong-m">Chapter {chapter.chapter_number}</Text>
                                <Text variant="body-default-s" onBackground="neutral-weak">
                                    {new Date(chapter.release_date).toLocaleDateString()}
                                </Text>
                            </Column>
                        </Link>

                        <Flex gap="8" vertical="center">
                            {!isSelectionMode && (
                                downloadedChapters.has(chapter.chapter_id) ? (
                                    <div style={{ color: 'var(--brand-solid-strong)' }}>
                                        <HiCheck size={20} />
                                    </div>
                                ) : (
                                    <IconButton
                                        variant="ghost"
                                        icon="download"
                                        size="m"
                                        tooltip="Download"
                                        onClick={() => handleSingleDownload(chapter.chapter_id)}
                                    />
                                )
                            )}
                            <Link href={`/chapter/${chapter.chapter_id}`}>
                                <Button variant="tertiary" size="s">Read</Button>
                            </Link>
                        </Flex>
                    </Flex>
                ))}
            </Column>
        </Column>
    );
};
