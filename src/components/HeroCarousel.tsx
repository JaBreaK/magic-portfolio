"use client";

import React, { useState, useEffect } from "react";
import { MangaListItem } from "@/types/api";
import { HeroSlide } from "./HeroSlide";

interface HeroCarouselProps {
    mangaList: MangaListItem[];
}

export const HeroCarousel = ({ mangaList }: HeroCarouselProps) => {
    const [activeIndex, setActiveIndex] = useState(0);

    const nextSlide = () => {
        setActiveIndex((prev) => (prev + 1) % mangaList.length);
    };

    const prevSlide = () => {
        setActiveIndex((prev) => (prev - 1 + mangaList.length) % mangaList.length);
    };

    useEffect(() => {
        const interval = setInterval(nextSlide, 5000);
        return () => clearInterval(interval);
    }, [mangaList.length]);

    if (!mangaList || mangaList.length === 0) return null;

    return (
        <div style={{
            position: 'relative',
            width: '100%',
            minHeight: 'clamp(300px, 50vh, 350px)', // adaptif mobile → desktop
            overflow: 'hidden',
            borderRadius: '16px',
            backgroundColor: '#020617',
            color: 'white',
            boxShadow:
                '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            paddingBottom: 'env(safe-area-inset-bottom)' // iOS notch safe
        }}>
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
    justify-content: flex-end !important;
    padding: 16px 16px 24px !important;
    gap: 16px !important;
    text-align: center !important;
    width: 100% !important;
    height: 100% !important;
  }

  .mobile-poster {
    width: 140px !important;
    height: 200px !important;
    transform: none !important;
    box-shadow: 0 12px 25px rgba(0, 0, 0, 0.6) !important;
  }

  .mobile-title {
    font-size: 20px !important;
    line-height: 1.2 !important;
    max-width: 90% !important;
    margin: 0 auto !important;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.8);
  }

  .mobile-container {
    min-height: 300px !important;
  }
}

            `}</style>

            {mangaList.map((manga, index) => (
                index === activeIndex && (
                    <HeroSlide key={manga.manga_id} manga={manga} isActive={true} />
                )
            ))}

            {/* Nav Buttons */}
            <button
                onClick={prevSlide}
                className="desktop-only"
                style={{
                    position: 'absolute',
                    left: '20px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    color: 'white',
                    border: '1px solid rgba(255,255,255,0.1)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    zIndex: 20,
                    backdropFilter: 'blur(4px)',
                    transition: 'all 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
            >
                ‹
            </button>
            <button
                onClick={nextSlide}
                className="desktop-only"
                style={{
                    position: 'absolute',
                    right: '20px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    color: 'white',
                    border: '1px solid rgba(255,255,255,0.1)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    zIndex: 20,
                    backdropFilter: 'blur(4px)',
                    transition: 'all 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
            >
                ›
            </button>
        </div>
    );
};
