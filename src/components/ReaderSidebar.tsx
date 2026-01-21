"use client";

import { useState } from "react";
import { Column, Flex, Button, Text, IconButton, Scroller } from "@once-ui-system/core";
import { ReaderSettings, ReaderSettingsState } from "./ReaderSettings";
import { ChapterDetail, MangaDetail } from "@/types/api";
import Link from "next/link";

interface ReaderSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    settings: ReaderSettingsState;
    onUpdateSettings: (settings: ReaderSettingsState) => void;
    manga: MangaDetail;
    currentChapterId: string;
    chapters: { id: string; number: number }[]; // Simplified chapter list
}

export const ReaderSidebar = ({
    isOpen,
    onClose,
    settings,
    onUpdateSettings,
    manga,
    currentChapterId,
    chapters
}: ReaderSidebarProps) => {
    const [activeTab, setActiveTab] = useState<'chapters' | 'settings'>('chapters');

    return (
        <>
            {/* Overlay */}
            {isOpen && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        zIndex: 40,
                        backdropFilter: 'blur(4px)'
                    }}
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <Column
                background="surface"
                border="neutral-medium"
                style={{
                    position: 'fixed',
                    top: 0,
                    right: 0,
                    bottom: 0,
                    width: '320px',
                    maxWidth: '80vw',
                    zIndex: 50,
                    transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
                    transition: 'transform 0.3s ease-in-out'
                }}
            >
                <Flex padding="16" horizontal="between" vertical="center" borderBottom="neutral-medium">
                    <Text variant="heading-strong-s">Menu</Text>
                    <IconButton icon="close" onClick={onClose} variant="tertiary" tooltip="Close" />
                </Flex>

                <Flex padding="8" gap="8" borderBottom="neutral-medium">
                    <Button
                        fillWidth
                        variant={activeTab === 'chapters' ? 'primary' : 'tertiary'}
                        onClick={() => setActiveTab('chapters')}
                    >
                        Chapters
                    </Button>
                    <Button
                        fillWidth
                        variant={activeTab === 'settings' ? 'primary' : 'tertiary'}
                        onClick={() => setActiveTab('settings')}
                    >
                        Settings
                    </Button>
                </Flex>

                <Scroller fillWidth fillHeight style={{ overflowY: 'auto' }}>
                    {activeTab === 'settings' ? (
                        <ReaderSettings settings={settings} onUpdate={onUpdateSettings} />
                    ) : (
                        <Column>
                            {chapters.map((chapter) => (
                                <Link key={chapter.id} href={`/chapter/${chapter.id}`} style={{ textDecoration: 'none' }}>
                                    <Flex
                                        padding="12"
                                        borderBottom="neutral-weak"
                                        background={chapter.id === currentChapterId ? 'neutral-alpha-weak' : undefined}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <Text variant={chapter.id === currentChapterId ? 'body-strong-s' : 'body-default-s'}>
                                            Chapter {chapter.number}
                                        </Text>
                                    </Flex>
                                </Link>
                            ))}
                        </Column>
                    )}
                </Scroller>
            </Column>
        </>
    );
};
