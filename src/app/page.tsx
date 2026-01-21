import { Heading, Column, Flex, Button, Grid } from "@once-ui-system/core";
import { api } from "@/services/api";
import { MangaCard, HeroCarousel, GenreScroller, FormatTabs, InfiniteMangaList } from "@/components";
import Link from "next/link";

export default async function Home() {
  const topManga = await api.getTopManga('all_time').catch(() => ({ data: [] }));

  // Fetch data for Format Tabs
  const manhuaList = await api.getMangaList({ format: 'manhua', sort: 'latest', is_recommended: true, page_size: 10 }).catch(() => ({ data: [] }));
  const mangaList = await api.getMangaList({ format: 'manga', sort: 'latest', is_recommended: true, page_size: 10 }).catch(() => ({ data: [] }));
  const manhwaList = await api.getMangaList({ format: 'manhwa', sort: 'latest', is_recommended: true, page_size: 10 }).catch(() => ({ data: [] }));

  return (
    <Column fillWidth gap="32" paddingY="8" horizontal="center" style={{ maxWidth: '100vw', overflowX: 'hidden' }}>

      {/* Hero / Top Manga Section */}
      <Column fillWidth maxWidth="xl" gap="16">
        <HeroCarousel mangaList={(topManga.data || []).slice(0, 10)} />
        <GenreScroller />

        {/* Format Tabs Section */}
        <FormatTabs
          manhuaList={manhuaList.data || []}
          mangaList={mangaList.data || []}
          manhwaList={manhwaList.data || []}
        />

        {/* Infinite Scroll List (Project & Mirror) */}
        <InfiniteMangaList />
      </Column>

    </Column>
  );
}
