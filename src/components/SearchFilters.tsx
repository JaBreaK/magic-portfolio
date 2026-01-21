"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Column, Flex, Text, Button, Input, Grid, Tag, Accordion, SegmentedControl } from "@once-ui-system/core";
import { TaxonomyItem } from "@/types/api";

interface SearchFiltersProps {
    genres: TaxonomyItem[];
}

export const SearchFilters = ({ genres }: SearchFiltersProps) => {
    const router = useRouter();
    const searchParams = useSearchParams();

    // State for filters
    const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
    const [status, setStatus] = useState<string>("");
    const [format, setFormat] = useState<string>("");
    const [sortBy, setSortBy] = useState<string>("latest");

    // Initialize state from URL params
    useEffect(() => {
        const genreParam = searchParams.get("genre_include");
        if (genreParam) {
            setSelectedGenres(genreParam.split(","));
        } else {
            setSelectedGenres([]);
        }

        setStatus(searchParams.get("status") || "");
        setFormat(searchParams.get("format") || "");
        setSortBy(searchParams.get("sort") || "latest");
    }, [searchParams]);

    const handleGenreToggle = (slug: string) => {
        const newGenres = selectedGenres.includes(slug)
            ? selectedGenres.filter(g => g !== slug)
            : [...selectedGenres, slug];
        setSelectedGenres(newGenres);
        updateParams({ genre_include: newGenres.join(",") });
    };

    const handleStatusChange = (val: string) => {
        const newValue = val === status ? "" : val; // Toggle off if same
        setStatus(newValue);
        updateParams({ status: newValue });
    };

    const handleFormatChange = (val: string) => {
        const newValue = val === format ? "" : val; // Toggle off if same
        setFormat(newValue);
        updateParams({ format: newValue });
    };

    const handleSortChange = (val: string) => {
        setSortBy(val);
        updateParams({ sort: val });
    };

    const updateParams = (updates: Record<string, string>) => {
        const params = new URLSearchParams(searchParams.toString());

        Object.entries(updates).forEach(([key, value]) => {
            if (value) {
                params.set(key, value);
            } else {
                params.delete(key);
            }
        });

        // Reset page to 1 on filter change
        params.set("page", "1");

        router.push(`/search?${params.toString()}`);
    };

    const clearFilters = () => {
        router.push("/search");
    };

    return (
        <Column fillWidth gap="24" padding="24" background="surface" radius="l" border="neutral-medium">
            <Flex fillWidth horizontal="between" vertical="center">
                <Text variant="heading-strong-s">Filters</Text>
                <Button variant="tertiary" size="s" onClick={clearFilters}>Clear All</Button>
            </Flex>

            {/* Sort By */}
            <Column gap="8">
                <Text variant="body-strong-s" onBackground="neutral-weak">Sort By</Text>
                <SegmentedControl
                    buttons={[
                        { label: 'Latest', value: 'latest' },
                        { label: 'Popular', value: 'view_count' },
                        { label: 'Title', value: 'title' }
                    ]}
                    selected={sortBy}
                    onToggle={handleSortChange}
                />
            </Column>

            {/* Status */}
            <Column gap="8">
                <Text variant="body-strong-s" onBackground="neutral-weak">Status</Text>
                <Flex gap="8" wrap>
                    {['Ongoing', 'Completed', 'Hiatus'].map((s) => (
                        <Tag
                            key={s}
                            variant={status === s ? 'brand' : 'neutral'}
                            onClick={() => handleStatusChange(s)}
                            style={{ cursor: 'pointer' }}
                        >
                            {s}
                        </Tag>
                    ))}
                </Flex>
            </Column>

            {/* Format */}
            <Column gap="8">
                <Text variant="body-strong-s" onBackground="neutral-weak">Format</Text>
                <Flex gap="8" wrap>
                    {['Manga', 'Manhwa', 'Manhua'].map((f) => (
                        <Tag
                            key={f}
                            variant={format === f ? 'brand' : 'neutral'}
                            onClick={() => handleFormatChange(f)}
                            style={{ cursor: 'pointer' }}
                        >
                            {f}
                        </Tag>
                    ))}
                </Flex>
            </Column>

            {/* Genres */}
            <Column gap="8">
                <Text variant="body-strong-s" onBackground="neutral-weak">Genres</Text>
                <Grid style={{ gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))" }} gap="8">
                    {genres.map((genre) => (
                        <Tag
                            key={genre.slug}
                            variant={selectedGenres.includes(genre.slug) ? 'brand' : 'neutral'}
                            onClick={() => handleGenreToggle(genre.slug)}
                            style={{ cursor: 'pointer', justifyContent: 'center' }}
                        >
                            {genre.name}
                        </Tag>
                    ))}
                </Grid>
            </Column>
        </Column>
    );
};
