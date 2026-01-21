"use client";

import Link from "next/link";
import React from "react";

interface GenreTagProps {
    name: string;
    slug: string;
}

export const GenreTag = ({ name, slug }: GenreTagProps) => {
    return (
        <Link
            href={`/search?genre_include=${slug}&genre_include_mode=and`}
            style={{ textDecoration: 'none' }}
        >
            <div style={{
                padding: '6px 16px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '9999px',
                color: '#e2e8f0',
                fontSize: '12px',
                fontWeight: 500,
                whiteSpace: 'nowrap',
                transition: 'all 0.2s',
                cursor: 'pointer'
            }}
                onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(45, 91, 177, 0.2)';
                    e.currentTarget.style.borderColor = 'rgba(58, 100, 237, 0.5)';
                    e.currentTarget.style.color = 'white';
                }}
                onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.color = '#e2e8f0';
                }}
            >
                {name}
            </div>
        </Link>
    );
};
