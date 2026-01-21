import { Column, Heading, Text, Flex, Badge, Grid } from "@once-ui-system/core";
import { api } from "@/services/api";
import { ChapterList, BookmarkButton, SmartImage, GenreTag, MangaDescription, ContinueReadingButton, ShareButton } from "@/components";
import * as motion from "framer-motion/client";
import { Metadata } from "next";

interface PageProps {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { id } = await params;
    try {
        const manga = await api.getMangaDetail(id);
        if (!manga || !manga.data) {
            return {
                title: 'Manga Not Found - BelloReaper',
                description: 'The requested manga could not be found.'
            };
        }

        return {
            title: `${manga.data.title} - Read on BelloReaper`,
            description: manga.data.description.substring(0, 160) + '...',
            openGraph: {
                title: `${manga.data.title} - Read on BelloReaper`,
                description: manga.data.description.substring(0, 160) + '...',
                images: [
                    {
                        url: manga.data.cover_image_url,
                        width: 800,
                        height: 600,
                        alt: manga.data.title,
                    },
                ],
                type: 'website',
            },
            twitter: {
                card: 'summary_large_image',
                title: `${manga.data.title} - Read on BelloReaper`,
                description: manga.data.description.substring(0, 160) + '...',
                images: [manga.data.cover_image_url],
            },
        };
    } catch (error) {
        return {
            title: 'Error - BelloReaper',
            description: 'An error occurred while loading the manga details.'
        };
    }
}

export default async function MangaDetail({ params }: PageProps) {
    const { id } = await params;
    console.log(`[MangaDetail] Fetching for ID: ${id}`);

    let manga;
    let chapters;

    try {
        manga = await api.getMangaDetail(id);
        chapters = await api.getChapterList(id, { page: 1, page_size: 1000, sort_by: 'chapter_number', sort_order: 'desc' });
    } catch (error) {
        console.error(`[MangaDetail] Error fetching data for ID ${id}:`, error);
        return (
            <Column fillWidth paddingY="32" horizontal="center">
                <Text>Error loading manga details. Please try again later.</Text>
                <Text variant="body-default-s" onBackground="neutral-weak">{String(error)}</Text>
            </Column>
        );
    }

    if (!manga || !manga.data) {
        console.log(`[MangaDetail] No data found for ID: ${id}`);
        return (
            <Column fillWidth paddingY="32" horizontal="center">
                <Text>Manga not found</Text>
            </Column>
        );
    }

    return (
        <Column fillWidth gap="32" paddingY="64" horizontal="center">
            <Grid
                gap="32"
                s={{ columns: "1" }}
                maxWidth="l"
                fillWidth
                style={{ gridTemplateColumns: "1fr 3fr" }}
            >
                {/* Cover Image */}
                <Column>
                    <motion.div layoutId={`poster-${manga.data.manga_id}`} transition={{ duration: 0.5 }}>
                        <SmartImage
                            src={manga.data.cover_image_url}
                            aspectRatio="3/4"
                            radius="l"
                            alt={manga.data.title}
                            objectFit="cover"
                            fillWidth
                        />
                    </motion.div>
                </Column>

                {/* Info */}
                <Column gap="16">
                    <motion.div layoutId={`title-footer-${manga.data.manga_id}`} transition={{ duration: 0.5 }}>
                        <Heading variant="display-strong-m">{manga.data.title}</Heading>
                    </motion.div>
                    <Text variant="body-default-l" onBackground="neutral-weak">{manga.data.alternative_title}</Text>

                    <Flex gap="8" wrap vertical="center">
                        <Badge background="neutral-alpha-weak">{manga.data.release_year}</Badge>
                        <Badge background={manga.data.status === 1 ? "success-alpha-weak" : "neutral-alpha-weak"}>
                            {manga.data.status === 1 ? "Ongoing" : "Completed"}
                        </Badge>
                        <Badge background="brand-alpha-weak">Rank #{manga.data.rank}</Badge>
                        <Text variant="body-default-s">★ {manga.data.user_rate}</Text>
                        <BookmarkButton manga={manga.data} />
                        <ShareButton
                            title={`Read ${manga.data.title} on BelloReaper`}
                            text={`Check out this manga: ${manga.data.title}`}
                            url={`https://bellonime.vercel.app/manga/${manga.data.manga_id}`}
                        />
                        <ContinueReadingButton
                            mangaId={manga.data.manga_id}
                            firstChapterId={chapters.data && chapters.data.length > 0 ? chapters.data[chapters.data.length - 1].chapter_id : ''}
                        />
                    </Flex>

                    <MangaDescription description={manga.data.description} />

                    <Flex gap="8" wrap>
                        {manga.data.taxonomy.Genre?.map((genre) => (
                            <GenreTag key={genre.slug} name={genre.name} slug={genre.slug} />
                        ))}
                    </Flex>
                </Column>
            </Grid>

            {/* Chapters */}
            <Column fillWidth maxWidth="l" gap="16">
                <Heading variant="display-strong-s">Chapters</Heading>
                <ChapterList chapters={chapters.data || []} mangaId={id} />
            </Column>
        </Column>
    );
}
