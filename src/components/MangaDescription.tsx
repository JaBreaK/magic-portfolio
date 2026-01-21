"use client";

import { Text } from "@once-ui-system/core";
import { useState } from "react";

export const MangaDescription = ({ description }: { description: string }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <>
            <div className={`description-container ${isExpanded ? 'expanded' : ''}`}>
                <Text variant="body-default-m" onBackground="neutral-weak">
                    {description}
                </Text>
            </div>
            {!isExpanded && (
                <div className="read-more-trigger" onClick={() => setIsExpanded(true)}>
                    <Text variant="body-default-s" style={{ color: '#3b82f6', cursor: 'pointer', fontWeight: 600 }}>
                        Read more
                    </Text>
                </div>
            )}
            <style jsx>{`
                /* Target the Text component's root element directly */
                .description-container :global(> *) {
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
                
                .description-container.expanded :global(> *) {
                    display: block;
                    -webkit-line-clamp: unset;
                }

                .read-more-trigger {
                    display: block;
                    margin-top: 8px;
                }
                
                /* Desktop: Always show full text, hide read more */
                @media (min-width: 768px) {
                    .description-container :global(> *) {
                        display: block !important;
                        -webkit-line-clamp: unset !important;
                    }
                    .read-more-trigger {
                        display: none !important;
                    }
                }
            `}</style>
        </>
    );
};
