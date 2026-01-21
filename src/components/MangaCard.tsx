"use client";

import React, { useState, useRef } from "react";
import { Text, Flex } from "@once-ui-system/core";
import { SmartImage } from "@/components";
import { MangaListItem } from "@/types/api";
import Link from "next/link";
import { motion } from "framer-motion";

interface MangaCardProps {
    manga: MangaListItem;
    portrait?: boolean;
}

export const MangaCard = ({ manga, portrait = false }: MangaCardProps) => {
    const [showTooltip, setShowTooltip] = useState(false);
    const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
    const cardRef = useRef<HTMLDivElement>(null);

    const handleMouseMove = (e: React.MouseEvent) => {
        setTooltipPos({ x: e.clientX + 16, y: e.clientY + 16 });
    };

    const getStatusInfo = (status: number) => {
        switch (status) {
            case 1: return { text: "ONG", color: "success-medium", bg: "#059669" }; // emerald-600
            case 2: return { text: "COM", color: "info-medium", bg: "#0284c7" }; // sky-600
            case 3: return { text: "HIA", color: "warning-medium", bg: "#d97706" }; // amber-600
            default: return { text: "UNKNOWN", color: "neutral-medium", bg: "#52525b" }; // zinc-600
        }
    };

    const statusInfo = getStatusInfo(manga.status);

    return (
        <>
            <Link href={`/manga/${manga.manga_id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                <div
                    ref={cardRef}
                    onMouseEnter={() => setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                    onMouseMove={handleMouseMove}
                    style={{
                        position: 'relative',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                        backgroundColor: '#27272a',
                        cursor: 'pointer'
                    }}
                >
                    {/* Cover Image */}
                    <div style={{ position: 'relative', width: '100%', aspectRatio: '2/3' }}>
                        <motion.div
                            layoutId={`poster-${manga.manga_id}`}
                            transition={{ duration: 0.5 }}
                            style={{ width: '100%', height: '100%' }}
                        >
                            <SmartImage
                                src={portrait ? manga.cover_portrait_url : manga.cover_image_url}
                                aspectRatio="2/3"
                                alt={manga.title}
                                objectFit="cover"
                                radius="none"
                            />
                        </motion.div>

                        {/* Overlay Container - Hides on Hover */}
                        <div style={{
                            position: 'absolute',
                            inset: 0,
                            transition: 'opacity 0.3s ease',
                            opacity: showTooltip ? 0 : 1
                        }}>
                            {/* Status Badge */}
                            <div style={{
                                position: 'absolute',
                                top: '12px',
                                left: '12px',
                                padding: '4px 12px',
                                borderRadius: '9999px',
                                backgroundColor: statusInfo.bg,
                                color: 'white',
                                fontSize: '12px',
                                fontWeight: 600,
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                            }}>
                                {statusInfo.text}
                            </div>

                            {/* Rating Badge */}
                            <div style={{
                                position: 'absolute',
                                top: '12px',
                                right: '12px',
                                padding: '4px 8px',
                                borderRadius: '9999px',
                                backgroundColor: '#eab308',
                                color: 'black',
                                fontSize: '12px',
                                fontWeight: 600,
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                            }}>
                                ★ {manga.user_rate}
                            </div>

                            {/* Title Gradient */}
                            <div style={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                background: 'linear-gradient(to top, rgba(0,0,0,0.98) 0%, rgba(0,0,0,0.85) 40%, rgba(0,0,0,0.3) 75%, transparent 100%)',
                                padding: '4px'
                            }}>
                                <motion.div layoutId={`title-${manga.manga_id}`}>
                                    <Text
                                        variant="body-strong-s"
                                        style={{
                                            color: 'white',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden',
                                            textShadow: '0 2px 4px rgba(0,0,0,0.8)'
                                        }}
                                    >
                                        {manga.title}
                                    </Text>
                                </motion.div>
                            </div>
                        </div>
                    </div>

                    
                </div>
            </Link>

            {/* Tooltip Portal */}
            {showTooltip && (
                <div
                    style={{
                        position: 'fixed',
                        top: tooltipPos.y,
                        left: tooltipPos.x,
                        zIndex: 9999,
                        width: '256px',
                        backgroundColor: 'rgba(24, 24, 27, 0.95)',
                        backdropFilter: 'blur(4px)',
                        borderRadius: '12px',
                        padding: '12px',
                        border: '1px solid #3f3f46',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                        pointerEvents: 'none'
                    }}
                >
                    <Text variant="body-strong-s" style={{ color: 'white', marginBottom: '4px', display: 'block' }}>
                        {manga.title}
                    </Text>
                    <Text variant="body-default-xs" style={{ color: '#a1a1aa', fontStyle: 'italic', marginBottom: '4px', display: 'block' }}>
                        {manga.alternative_title}
                    </Text>
                    <Text variant="body-default-xs" style={{
                        color: '#d4d4d8',
                        marginBottom: '8px',
                        display: '-webkit-box',
                        WebkitLineClamp: 4,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                    }}>
                        {manga.description}
                    </Text>

                    <Flex fillWidth horizontal="between" style={{ fontSize: '10px', color: '#a1a1aa' }}>
                        <span>Status: <span style={{ color: 'white' }}>{statusInfo.text}</span></span>
                        <span>Year: <span style={{ color: 'white' }}>{manga.release_year}</span></span>
                    </Flex>
                    <Flex fillWidth horizontal="between" style={{ fontSize: '10px', color: '#a1a1aa', marginTop: '4px' }}>
                        <span>Chapter: <span style={{ color: 'white' }}>{manga.latest_chapter_number}</span></span>
                        <span>Rating: <span style={{ color: 'white' }}>{manga.user_rate}</span></span>
                    </Flex>
                </div>
            )}
        </>
    );
};
