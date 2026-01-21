"use client";

import React, { useEffect, useState, useRef, MouseEvent } from 'react';
import { api } from '@/services/api';
import { TaxonomyItem } from '@/types/api';
import Link from 'next/link';

export const GenreScroller = () => {
    const [genres, setGenres] = useState<TaxonomyItem[]>([]);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const animationRef = useRef<number>(0);

    useEffect(() => {
        const fetchGenres = async () => {
            try {
                const response = await api.getGenres();
                if (response.data) {
                    setGenres(response.data);
                }
            } catch (error) {
                console.error("Failed to fetch genres:", error);
            }
        };

        fetchGenres();
    }, []);

    // Auto-scroll logic
    useEffect(() => {
        const scroll = () => {
            if (scrollContainerRef.current && !isDragging && !isPaused) {
                if (scrollContainerRef.current.scrollLeft >= scrollContainerRef.current.scrollWidth / 2) {
                    scrollContainerRef.current.scrollLeft = 0;
                } else {
                    scrollContainerRef.current.scrollLeft += 0.5; // Adjust speed here
                }
            }
            animationRef.current = requestAnimationFrame(scroll);
        };

        animationRef.current = requestAnimationFrame(scroll);

        return () => cancelAnimationFrame(animationRef.current);
    }, [isDragging, isPaused, genres]); // Re-run when state changes

    const handleMouseDown = (e: MouseEvent) => {
        if (!scrollContainerRef.current) return;
        setIsDragging(true);
        setIsPaused(true);
        setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
        setScrollLeft(scrollContainerRef.current.scrollLeft);
    };

    const handleMouseLeave = () => {
        setIsDragging(false);
        setIsPaused(false);
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        setIsPaused(false);
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (!isDragging || !scrollContainerRef.current) return;
        e.preventDefault();
        const x = e.pageX - scrollContainerRef.current.offsetLeft;
        const walk = (x - startX) * 2;
        scrollContainerRef.current.scrollLeft = scrollLeft - walk;
    };

    if (genres.length === 0) return null;

    // Duplicate genres enough times to ensure smooth infinite scroll
    const displayGenres = [...genres, ...genres, ...genres];

    return (
        <div style={{
            width: '100%',
            overflow: 'hidden',
            padding: '20px 0',
            position: 'relative',
            maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
            WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)'
        }}>
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
                    width: '100%',
                    cursor: isDragging ? 'grabbing' : 'grab',
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                    userSelect: 'none'
                }}
            >
                <style jsx>{`
                    div::-webkit-scrollbar {
                        display: none;
                    }
                `}</style>

                {displayGenres.map((genre, index) => (
                    <Link
                        key={`${genre.taxonomy_id}-${index}`}
                        href={`/search?genre_include=${genre.slug}&genre_include_mode=and`}
                        style={{ textDecoration: 'none', pointerEvents: isDragging ? 'none' : 'auto' }}
                    >
                        <div style={{
                            padding: '8px 20px',
                            backgroundColor: 'var(--neutral-alpha-weak)',
                            border: '1px solid var(--neutral-alpha-medium)',
                            borderRadius: '9999px',
                            color: 'var(--neutral-on-background-strong)',
                            fontSize: '14px',
                            fontWeight: 500,
                            whiteSpace: 'nowrap',
                            transition: 'all 0.2s',
                        }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.backgroundColor = 'var(--brand-alpha-weak)';
                                e.currentTarget.style.borderColor = 'var(--brand-solid-strong)';
                                e.currentTarget.style.color = 'var(--brand-solid-strong)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.backgroundColor = 'var(--neutral-alpha-weak)';
                                e.currentTarget.style.borderColor = 'var(--neutral-alpha-medium)';
                                e.currentTarget.style.color = 'var(--neutral-on-background-strong)';
                            }}
                        >
                            {genre.name}
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};
