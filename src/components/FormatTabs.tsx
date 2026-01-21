"use client";

import React, { useState, useRef, MouseEvent } from 'react';
import { MangaListItem } from '@/types/api';
import { MangaCard } from '@/components/MangaCard';

interface FormatTabsProps {
    manhuaList: MangaListItem[];
    mangaList: MangaListItem[];
    manhwaList: MangaListItem[];
}

export const FormatTabs = ({ manhuaList, mangaList, manhwaList }: FormatTabsProps) => {
    const [activeTab, setActiveTab] = useState<'manhua' | 'manga' | 'manhwa'>('manhua');
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    // Refs for drag logic to avoid re-renders on every mouse move
    const isDown = useRef(false);
    const startX = useRef(0);
    const scrollLeft = useRef(0);

    const tabs = [
        { id: 'manhua', label: 'Manhua', data: manhuaList },
        { id: 'manga', label: 'Manga', data: mangaList },
        { id: 'manhwa', label: 'Manhwa', data: manhwaList },
    ];

    const activeData = tabs.find(t => t.id === activeTab)?.data || [];

    const handleMouseDown = (e: MouseEvent) => {
        if (!scrollContainerRef.current) return;
        isDown.current = true;
        startX.current = e.pageX - scrollContainerRef.current.offsetLeft;
        scrollLeft.current = scrollContainerRef.current.scrollLeft;
    };

    const handleMouseLeave = () => {
        isDown.current = false;
        setIsDragging(false);
    };

    const handleMouseUp = () => {
        isDown.current = false;
        // Small delay to ensure click events fire before resetting drag state if needed, 
        // but mainly we just turn off dragging.
        setTimeout(() => setIsDragging(false), 0);
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (!isDown.current || !scrollContainerRef.current) return;
        e.preventDefault();
        const x = e.pageX - scrollContainerRef.current.offsetLeft;
        const walk = (x - startX.current) * 2; // Scroll-fast

        // Only start dragging if moved more than 5px to distinguish from click
        if (Math.abs(x - startX.current) > 5) {
            if (!isDragging) setIsDragging(true);
            scrollContainerRef.current.scrollLeft = scrollLeft.current - walk;
        }
    };

    return (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Tabs Header */}
            <div style={{
                display: 'flex',
                gap: '16px',
                borderBottom: '1px solid var(--neutral-alpha-medium)',
                paddingBottom: '16px',
                overflowX: 'auto',
                whiteSpace: 'nowrap',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
            }}>
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        style={{
                            background: 'none',
                            border: 'none',
                            padding: '8px 16px',
                            fontSize: '18px',
                            fontWeight: activeTab === tab.id ? 700 : 500,
                            color: activeTab === tab.id ? 'var(--neutral-on-background-strong)' : 'var(--neutral-on-background-medium)',
                            cursor: 'pointer',
                            position: 'relative',
                            transition: 'all 0.3s'
                        }}
                    >
                        {tab.label}
                        {activeTab === tab.id && (
                            <div style={{
                                position: 'absolute',
                                bottom: '-17px',
                                left: 0,
                                right: 0,
                                height: '2px',
                                backgroundColor: 'var(--brand-solid-strong)', // blue-500
                                borderRadius: '2px'
                            }} />
                        )}
                    </button>
                ))}
            </div>

            {/* Horizontal Scroll Container */}
            <div
                ref={scrollContainerRef}
                onMouseDown={handleMouseDown}
                onMouseLeave={handleMouseLeave}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
                style={{
                    display: 'flex',
                    gap: '16px',
                    overflowX: 'auto',
                    paddingBottom: '20px',
                    cursor: isDragging ? 'grabbing' : 'grab',
                    scrollbarWidth: 'none', // Firefox
                    msOverflowStyle: 'none',  // IE 10+
                    userSelect: 'none' // Prevent text selection while dragging
                }}
            >
                <style jsx>{`
                    div::-webkit-scrollbar {
                        display: none; /* Chrome, Safari, Opera */
                    }
                `}</style>

                {activeData.map((manga) => (
                    <div key={manga.manga_id} style={{ minWidth: '160px', width: '160px', pointerEvents: isDragging ? 'none' : 'auto' }}>
                        <MangaCard manga={manga} />
                    </div>
                ))}
            </div>
        </div>
    );
};
