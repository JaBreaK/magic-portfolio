"use client";

import { useState, useEffect, useRef } from "react";
import { Column, Flex, Button, Text, IconButton } from "@once-ui-system/core";
import { SmartImage } from "@/components";
import { ChapterDetail, MangaDetail } from "@/types/api";
import { addToHistory, getHistory } from "@/utils/library";
import { downloadManager } from "@/services/downloadManager";
import { DownloadButton } from "./DownloadButton";
import { ReaderSidebar } from "./ReaderSidebar";
import { ReaderSettingsState } from "./ReaderSettings";
import Link from "next/link";

interface ReaderProps {
    chapter: ChapterDetail;
    manga: MangaDetail;
    chapterList: { id: string; number: number }[];
}

export const Reader = ({ chapter, manga, chapterList }: ReaderProps) => {
    const [images, setImages] = useState<string[]>([]);
    const imageRefs = useRef<(HTMLDivElement | null)[]>([]);

    // Sidebar State
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Settings State
    const [settings, setSettings] = useState<ReaderSettingsState>({
        mode: 'webtoon',
        direction: 'ltr',
        fit: 'width',
        scrollSpeed: 1,
        zoom: 100
    });

    useEffect(() => {
        // Load settings from local storage if available
        const savedSettings = localStorage.getItem('reader_settings');
        if (savedSettings) {
            setSettings(JSON.parse(savedSettings));
        }
    }, []);

    const updateSettings = (newSettings: ReaderSettingsState) => {
        setSettings(newSettings);
        localStorage.setItem('reader_settings', JSON.stringify(newSettings));
    };

    useEffect(() => {
        const loadChapter = async () => {
            if (chapter) {
                // Check if downloaded
                const isDownloaded = await downloadManager.isChapterDownloaded(chapter.chapter_id);

                if (isDownloaded) {
                    const localImages = await downloadManager.getChapterImages(chapter.chapter_id);
                    setImages(localImages);
                } else {
                    const imageUrls = chapter.chapter.data.map(filename =>
                        `${chapter.base_url}${chapter.chapter.path}${filename}`
                    );
                    setImages(imageUrls);
                }

                // Check history for saved progress
                const history = getHistory();
                const savedProgress = history.find(h => h.chapterId === chapter.chapter_id);

                if (savedProgress && savedProgress.imageIndex && savedProgress.imageIndex > 0) {
                    // Scroll to saved image after a short delay to allow rendering
                    setTimeout(() => {
                        const target = imageRefs.current[savedProgress.imageIndex!];
                        if (target) {
                            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                    }, 500);
                } else {
                    // Initial add to history if no progress
                    if (manga) {
                        addToHistory(manga, chapter, 0);
                    }
                }
            }
        };

        loadChapter();
    }, [chapter, manga]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const index = Number(entry.target.getAttribute('data-index'));
                        if (!isNaN(index)) {
                            addToHistory(manga, chapter, index);
                        }
                    }
                });
            },
            {
                root: null,
                rootMargin: '0px',
                threshold: 0.5 // Trigger when 50% of the image is visible
            }
        );

        imageRefs.current.forEach((img) => {
            if (img) observer.observe(img);
        });

        return () => {
            observer.disconnect();
        };
    }, [images, manga, chapter]);

    // Auto Scroll State
    const [isAutoScrolling, setIsAutoScrolling] = useState(false);
    const scrollRef = useRef<number>(0);

    // Auto Scroll Logic
    useEffect(() => {
        const scroll = () => {
            if (isAutoScrolling) {
                window.scrollBy(0, settings.scrollSpeed || 1); // Use scrollSpeed from settings
                scrollRef.current = requestAnimationFrame(scroll);
            }
        };

        if (isAutoScrolling) {
            scrollRef.current = requestAnimationFrame(scroll);
            setShowControls(false); // Hide controls when auto-scroll starts
        } else {
            cancelAnimationFrame(scrollRef.current);
        }

        return () => cancelAnimationFrame(scrollRef.current);
    }, [isAutoScrolling]);

    // Toggle controls on click
    const toggleControls = () => {
        if (isAutoScrolling) {
            setShowControls(prev => !prev);
        } else {
            setShowControls(prev => !prev);
        }
    };

    // Auto-hide controls on scroll in webtoon mode (only if NOT auto-scrolling)
    useEffect(() => {
        let lastScrollY = window.scrollY;
        const handleScroll = () => {
            if (settings.mode === 'webtoon' && !isAutoScrolling) {
                const currentScrollY = window.scrollY;
                if (currentScrollY > lastScrollY && currentScrollY > 100) {
                    setShowControls(false);
                }
                lastScrollY = currentScrollY;
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [settings.mode, isAutoScrolling]);

    const [showControls, setShowControls] = useState(true);

    // Auto Next Chapter Logic
    const [isNextChapterLoading, setIsNextChapterLoading] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!settings.mode || settings.mode !== 'webtoon' || !chapter.next_chapter_id || images.length === 0) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !isNextChapterLoading) {
                    setIsNextChapterLoading(true);
                    // Navigate to next chapter
                    window.location.href = `/chapter/${chapter.next_chapter_id}`;
                }
            },
            { rootMargin: '200px' } // Trigger 200px before bottom
        );

        if (bottomRef.current) {
            observer.observe(bottomRef.current);
        }

        return () => observer.disconnect();
    }, [chapter.next_chapter_id, settings.mode, isNextChapterLoading, images.length]);

    return (
        <Column fillWidth fillHeight background="page" style={{ position: 'relative', minHeight: '100vh' }}>

            {/* Click Area for Toggling Controls (Invisible Layer) */}
            <div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 20,
                    pointerEvents: 'none'
                }}
            />

            {/* Floating Back Button (Top Left) */}
            <div style={{
                position: 'fixed',
                top: '24px',
                left: '24px',
                zIndex: 40,
                opacity: showControls ? 1 : 0,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                pointerEvents: showControls ? 'auto' : 'none'
            }}>
                <Link href={`/manga/${chapter.manga_id}`}>
                    <Button
                        variant="secondary"
                        prefixIcon="arrowLeft"
                        style={{
                            backdropFilter: 'blur(12px)',
                            backgroundColor: 'rgba(0,0,0,0.6)',
                            color: 'white',
                            border: '1px solid rgba(255,255,255,0.1)',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                        }}
                    >
                        Back
                    </Button>
                </Link>
            </div>

            {/* Floating Auto Scroll Button (Above Settings) */}
            {settings.mode === 'webtoon' && (
                <div style={{
                    position: 'fixed',
                    bottom: '96px', // 32px (bottom) + 48px (settings height) + 16px (gap)
                    right: '32px',
                    zIndex: 40,
                    opacity: showControls || isAutoScrolling ? 1 : 0,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    pointerEvents: showControls || isAutoScrolling ? 'auto' : 'none'
                }}>
                    <Button
                        variant="secondary"
                        prefixIcon={isAutoScrolling ? "pause" : "play"}
                        size="l"
                        style={{
                            borderRadius: '50%',
                            width: '48px',
                            height: '48px',
                            padding: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backdropFilter: 'blur(12px)',
                            backgroundColor: isAutoScrolling ? 'rgba(59, 130, 246, 0.8)' : 'rgba(0,0,0,0.6)', // Blue when active
                            color: 'white',
                            border: '1px solid rgba(255,255,255,0.1)',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                        }}
                        onClick={(e: React.MouseEvent) => {
                            e.stopPropagation();
                            setIsAutoScrolling(!isAutoScrolling);
                        }}
                    />
                </div>
            )}

            {/* Floating Settings Button (Bottom Right) */}
            <div style={{
                position: 'fixed',
                bottom: '32px',
                right: '32px',
                zIndex: 40,
                opacity: showControls && !isAutoScrolling ? 1 : 0,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                pointerEvents: showControls && !isAutoScrolling ? 'auto' : 'none',
                display: 'flex',
                gap: '16px',
                alignItems: 'center'
            }}>
                <DownloadButton manga={manga} chapter={chapter} images={images} />
                <Button
                    variant="secondary"
                    prefixIcon="settings"
                    size="l"
                    style={{
                        borderRadius: '50%',
                        width: '48px',
                        height: '48px',
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backdropFilter: 'blur(12px)',
                        backgroundColor: 'rgba(0,0,0,0.6)',
                        color: 'white',
                        border: '1px solid rgba(255,255,255,0.1)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                    }}
                    onClick={() => setIsSidebarOpen(true)}
                />
            </div>

            {/* Sidebar */}
            <ReaderSidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                settings={settings}
                onUpdateSettings={updateSettings}
                manga={manga}
                currentChapterId={chapter.chapter_id}
                chapters={chapterList}
            />

            {/* Content Area */}
            <Column
                fillWidth
                horizontal="center"
                onClick={toggleControls} // Toggle controls when clicking content
                style={{
                    flex: 1,
                    overflowY: settings.mode === 'webtoon' ? 'visible' : 'hidden',
                    height: settings.mode === 'single' ? '100vh' : 'auto',
                    cursor: 'pointer'
                }}
            >
                {settings.mode === 'webtoon' ? (
                    // Webtoon Mode (Vertical List)
                    <Column fillWidth maxWidth="l" horizontal="center" paddingY="0">
                        {images.map((src, index) => (
                            <div
                                key={index}
                                ref={el => { imageRefs.current[index] = el }}
                                data-index={index}
                                style={{
                                    width: settings.fit === 'width' ? `${settings.zoom || 100}%` : 'auto',
                                    maxWidth: settings.fit === 'height' ? 'none' : `${settings.zoom || 100}%`,
                                    height: settings.fit === 'height' ? '100vh' : 'auto',
                                    minHeight: '50vh',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    transition: 'width 0.2s, max-width 0.2s'
                                }}
                            >
                                <SmartImage
                                    src={src}
                                    alt={`Page ${index + 1}`}
                                    fillWidth={settings.fit === 'width'}
                                    style={{
                                        height: settings.fit === 'height' ? '100%' : 'auto',
                                        width: settings.fit === 'height' ? 'auto' : '100%',
                                        objectFit: 'contain'
                                    }}
                                    loading="lazy"
                                />
                            </div>
                        ))}

                        {/* Navigation Buttons for Webtoon */}
                        <Flex fillWidth horizontal="center" padding="64" gap="16" style={{ paddingBottom: '128px' }}>
                            {chapter.prev_chapter_id && (
                                <Link href={`/chapter/${chapter.prev_chapter_id}`} onClick={(e) => e.stopPropagation()}>
                                    <Button variant="secondary" prefixIcon="chevronLeft">Prev</Button>
                                </Link>
                            )}
                            {chapter.next_chapter_id && (
                                <Link href={`/chapter/${chapter.next_chapter_id}`} onClick={(e) => e.stopPropagation()}>
                                    <Button variant="primary" suffixIcon="chevronRight">Next</Button>
                                </Link>
                            )}
                        </Flex>

                        {/* Auto Next Trigger Area */}
                        {chapter.next_chapter_id && images.length > 0 && (
                            <div ref={bottomRef} style={{ height: '100px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                {isNextChapterLoading && <Text>Loading next chapter...</Text>}
                            </div>
                        )}
                    </Column>
                ) : (
                    // Single Page Mode (Horizontal Scroll Snap)
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: settings.direction === 'rtl' ? 'row-reverse' : 'row',
                            overflowX: 'auto',
                            scrollSnapType: 'x mandatory',
                            width: '100%',
                            height: '100%',
                            alignItems: 'center'
                        }}
                    >
                        {images.map((src, index) => (
                            <div
                                key={index}
                                ref={el => { imageRefs.current[index] = el }}
                                data-index={index}
                                style={{
                                    flex: '0 0 100%',
                                    width: '100%',
                                    height: '100%',
                                    scrollSnapAlign: 'center',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    padding: '0' // Remove padding for immersive feel
                                }}
                            >
                                <img
                                    src={src}
                                    alt={`Page ${index + 1}`}
                                    style={{
                                        maxWidth: '100%',
                                        maxHeight: '100%',
                                        objectFit: 'contain',
                                        width: settings.fit === 'width' ? '100%' : 'auto',
                                        height: settings.fit === 'height' ? '100%' : 'auto'
                                    }}
                                    loading="lazy"
                                />
                            </div>
                        ))}
                    </div>
                )}
            </Column>
        </Column>
    );
};
