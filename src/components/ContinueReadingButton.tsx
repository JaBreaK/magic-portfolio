"use client";

import { useState, useEffect } from "react";
import { Button } from "@once-ui-system/core";
import { getHistory } from "@/utils/library";
import Link from "next/link";

interface ContinueReadingButtonProps {
    mangaId: string;
    firstChapterId: string;
}

export const ContinueReadingButton = ({ mangaId, firstChapterId }: ContinueReadingButtonProps) => {
    const [lastChapterId, setLastChapterId] = useState<string | null>(null);
    const [lastChapterNumber, setLastChapterNumber] = useState<number | null>(null);

    useEffect(() => {
        const history = getHistory();
        const historyItem = history.find(h => h.mangaId === mangaId);

        if (historyItem) {
            setLastChapterId(historyItem.chapterId);
            setLastChapterNumber(historyItem.chapterNumber);
        }
    }, [mangaId]);

    const targetChapterId = lastChapterId || firstChapterId;
    const label = lastChapterId
        ? `Continue Chapter ${lastChapterNumber}`
        : "Start Reading";

    if (!targetChapterId) return null;

    return (
        <Link href={`/chapter/${targetChapterId}`}>
            <Button variant="primary" size="m" prefixIcon="play">
                {label}
            </Button>
        </Link>
    );
};
