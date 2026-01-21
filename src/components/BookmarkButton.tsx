"use client";

import { useState, useEffect } from "react";
import { Button } from "@once-ui-system/core";
import { isBookmarked, toggleBookmark } from "@/utils/library";
import { MangaDetail, MangaListItem } from "@/types/api";

interface BookmarkButtonProps {
    manga: MangaListItem | MangaDetail;
}

export const BookmarkButton = ({ manga }: BookmarkButtonProps) => {
    const [bookmarked, setBookmarked] = useState(false);

    useEffect(() => {
        setBookmarked(isBookmarked(manga.manga_id));
    }, [manga.manga_id]);

    const handleToggle = () => {
        toggleBookmark(manga);
        setBookmarked(!bookmarked);
    };

    return (
        <Button
            variant={bookmarked ? "primary" : "secondary"}
            onClick={handleToggle}
            prefixIcon={bookmarked ? "check" : "plus"}
            size="s"
        >
            {bookmarked ? "Bookmarked" : "Bookmark"}
        </Button>
    );
};
