"use client";

import React, { useState } from "react";
import { SmartImage } from "@/components";
import { MangaListItem } from "@/types/api";
import Link from "next/link";

interface HeroSlideProps {
    manga: MangaListItem;
    isActive: boolean;
}

export const HeroSlide = ({ manga, isActive }: HeroSlideProps) => {
    const [showTooltip, setShowTooltip] = useState(false);
    const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

    const handleMouseMove = (e: React.MouseEvent) => {
        if (window.matchMedia('(hover: hover)').matches) {
            setTooltipPos({ x: e.clientX + 20, y: e.clientY + 20 });
        }
    };

    const formatNumber = (num: number) => {
        return num?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") || "0";
    };

    const getStatusInfo = (status: number) => {
        switch (status) {
            case 1: return { text: "ONGOING", color: "white", bg: "#10b981" };
            case 2: return { text: "COMPLETED", color: "white", bg: "#0ea5e9" };
            case 3: return { text: "HIATUS", color: "white", bg: "#f59e0b" };
            default: return { text: "UNKNOWN", color: "white", bg: "#6b7280" };
        }
    };

    const statusInfo = getStatusInfo(manga.status);

    if (!isActive) return null;

    return (
        <>
            {/* Animation & Responsive Styles */}
            <style jsx>{`
                @keyframes slideIn {
                    from { opacity: 0; transform: translateX(20px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-slide {
                    animation: slideIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                .animate-fade {
                    animation: fadeIn 0.8s ease-out forwards;
                }
                
                /* Mobile Styles */
                @media (max-width: 768px) {
                    .desktop-only {
                        display: none !important;
                    }
                    .mobile-layout {
                        flex-direction: column !important;
                        align-items: center !important;
                        justify-content: center !important;
                        padding: 32px 24px !important;
                        gap: 24px !important;
                        text-align: center !important;
                    }
                    .mobile-poster {
                        width: 160px !important;
                        height: 220px !important;
                        transform: none !important;
                        box-shadow: 0 15px 30px rgba(0,0,0,0.5) !important;
                    }
                    .mobile-title {
                        font-size: 28px !important;
                        text-shadow: 0 2px 10px rgba(0,0,0,0.8);
                        width: 100% !important;
                    }
                    .mobile-container {
                        min-height: 420px !important;
                    }
                }
            `}</style>

            {/* Background Layer (Blurred) */}
            <div
                className="animate-fade"
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 0,
                }}
            >
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: `url(${manga.cover_portrait_url})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    filter: 'blur(24px) brightness(0.6)',
                    transform: 'scale(1.1)'
                }} />
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to right, rgba(2,6,23,0.95) 20%, rgba(2,6,23,0.8) 60%, rgba(2,6,23,0.4) 100%)'
                }} />
            </div>

            {/* Content Container */}
            <div
                className="animate-slide mobile-layout mobile-container"
                style={{
                    position: 'relative',
                    zIndex: 8,
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '40px',
                    gap: '40px'
                }}
            >
                {/* Left: Poster Group */}
                <Link href={`/manga/${manga.manga_id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div
                        style={{ position: 'relative', flexShrink: 0 }}
                        onMouseEnter={() => setShowTooltip(true)}
                        onMouseLeave={() => setShowTooltip(false)}
                        onMouseMove={handleMouseMove}
                    >
                        <div className="mobile-poster" style={{
                            width: '200px',
                            height: '280px',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            transform: 'rotate(-2deg)',
                            transition: 'transform 0.3s ease'
                        }}>
                            <SmartImage
                                src={manga.cover_image_url}
                                alt={manga.title}
                                fillWidth
                                objectFit="cover"
                                radius="none"
                            />
                        </div>

                        {/* Status Badge - Visible on Mobile */}
                        <span style={{
                            position: 'absolute',
                            top: '12px',
                            left: '12px',
                            padding: '4px 10px',
                            borderRadius: '9999px',
                            backgroundColor: statusInfo.bg,
                            color: 'white',
                            fontSize: '11px',
                            fontWeight: 700,
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}>
                            {statusInfo.text}
                        </span>

                        {/* Rating Badge - Visible on Mobile */}
                        <span style={{
                            position: 'absolute',
                            top: '12px',
                            right: '12px',
                            padding: '4px 10px',
                            borderRadius: '9999px',
                            backgroundColor: 'rgba(0,0,0,0.8)',
                            color: '#fbbf24', // amber-400
                            fontSize: '11px',
                            fontWeight: 700,
                            backdropFilter: 'blur(4px)',
                            border: '1px solid rgba(255,255,255,0.1)'
                        }}>
                            ★ {manga.user_rate}
                        </span>
                    </div>
                </Link>

                {/* Right: Info */}
                <div style={{ maxWidth: '650px' }}>
                    <Link href={`/manga/${manga.manga_id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <h1 className="mobile-title" style={{
                            fontSize: '42px',
                            fontWeight: 800,
                            marginBottom: '12px',
                            lineHeight: 1.1,
                            textShadow: '0 4px 8px rgba(0,0,0,0.5)',
                            background: 'linear-gradient(to right, #fff, #cbd5e1)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            cursor: 'pointer'
                        }}>
                            {manga.title}
                        </h1>
                    </Link>

                    <p className="desktop-only" style={{
                        color: '#cbd5e1', // slate-300
                        marginBottom: '24px',
                        fontSize: '16px',
                        lineHeight: 1.6,
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        maxWidth: '90%'
                    }}>
                        {manga.description}
                    </p>

                    {/* Grid Details */}
                    <div className="desktop-only" style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, auto)',
                        columnGap: '40px',
                        rowGap: '10px',
                        fontSize: '14px',
                        color: '#94a3b8', // slate-400
                        marginBottom: '32px'
                    }}>
                        <div><strong style={{ color: '#e2e8f0' }}>Alt Title:</strong> {manga.alternative_title}</div>
                        <div><strong style={{ color: '#e2e8f0' }}>Year:</strong> {manga.release_year}</div>
                        <div><strong style={{ color: '#e2e8f0' }}>Country:</strong> {manga.country_id}</div>
                        <div><strong style={{ color: '#e2e8f0' }}>Latest Chapter:</strong> {manga.latest_chapter_number}</div>
                        <div><strong style={{ color: '#e2e8f0' }}>Views:</strong> {formatNumber(manga.view_count)}</div>
                        <div><strong style={{ color: '#e2e8f0' }}>Bookmarks:</strong> {formatNumber(manga.bookmark_count)}</div>
                    </div>

                    {/* Buttons */}
                    <div className="desktop-only" style={{ display: 'flex', gap: '16px' }}>
                        <Link href={`/manga/${manga.manga_id}`}>
                            <button style={{
                                backgroundColor: '#3b82f6', // violet-600
                                color: 'white',
                                padding: '14px 32px',
                                borderRadius: '9999px',
                                border: 'none',
                                cursor: 'pointer',
                                fontWeight: 700,
                                fontSize: '15px',
                                transition: 'all 0.2s',
                                boxShadow: '0 10px 15px -3px rgba(58, 61, 237, 0.3)'
                            }}
                                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                Read Now
                            </button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Tooltip (Desktop Only) */}
            {showTooltip && (
                <div className="desktop-only" style={{
                    position: 'fixed',
                    top: tooltipPos.y,
                    left: tooltipPos.x,
                    zIndex: 100,
                    maxWidth: '320px',
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    color: '#e2e8f0',
                    padding: '16px',
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
                    pointerEvents: 'none',
                    fontSize: '13px',
                    lineHeight: 1.5
                }}>
                    <div style={{ fontWeight: 700, marginBottom: '4px', color: 'white', fontSize: '14px' }}>{manga.title}</div>
                    <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '12px', fontStyle: 'italic' }}>{manga.alternative_title}</div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span>Status:</span>
                        <span style={{ color: 'white', fontWeight: 600 }}>{statusInfo.text}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span>Rating:</span>
                        <span style={{ color: '#fbbf24', fontWeight: 600 }}>★ {manga.user_rate}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span>Views:</span>
                        <span style={{ color: 'white' }}>{formatNumber(manga.view_count)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                        <span>Latest Chapter:</span>
                        <span style={{ color: '#3b82f6', fontWeight: 700 }}>{manga.latest_chapter_number}</span>
                    </div>
                </div>
            )}
        </>
    );
};
