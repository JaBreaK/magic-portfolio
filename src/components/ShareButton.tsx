"use client";

import { Button, Toast, useToast } from "@once-ui-system/core";
import { useState } from "react";

interface ShareButtonProps {
    title: string;
    text: string;
    url: string;
}

export const ShareButton = ({ title, text, url }: ShareButtonProps) => {
    const { addToast } = useToast();
    const [isSharing, setIsSharing] = useState(false);

    const handleShare = async () => {
        setIsSharing(true);
        try {
            if (navigator.share) {
                await navigator.share({
                    title,
                    text,
                    url
                });
            } else {
                await navigator.clipboard.writeText(url);
                addToast({
                    variant: "success",
                    message: "Link copied to clipboard!",
                });
            }
        } catch (error) {
            console.error('Error sharing:', error);
        } finally {
            setIsSharing(false);
        }
    };

    return (
        <Button
            variant="secondary"
            prefixIcon="share"
            onClick={handleShare}
            loading={isSharing}
        >
            Share
        </Button>
    );
};
