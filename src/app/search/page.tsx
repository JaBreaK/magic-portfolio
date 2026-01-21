import { Column, Grid, Heading, Input, Button, Flex, Text } from "@once-ui-system/core";
import { api } from "@/services/api";
import { MangaCard, SearchFilters } from "@/components";
import { redirect } from "next/navigation";

interface PageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SearchPage({ searchParams }: PageProps) {
    const params = await searchParams;
    const q = typeof params.q === 'string' ? params.q : '';
    const page = Number(params.page) || 1;
    const pageSize = 24;

    // Fetch genres for filters
    const genres = await api.getGenres().catch(() => ({ data: [] }));

    // Fetch manga list with filters
    const mangaList = await api.getMangaList({
        q,
        page,
        page_size: pageSize,
        genre_include: typeof params.genre_include === 'string' ? params.genre_include : undefined,
        status: typeof params.status === 'string' ? params.status : undefined,
        format: typeof params.format === 'string' ? params.format : undefined,
        sort: typeof params.sort === 'string' ? params.sort : 'latest',
    });

    const totalPages = mangaList.meta.total_page || 1;

    return (
        <Column fillWidth gap="32" paddingY="32" horizontal="center">
            

            {/* Search Bar */}
            <Column fillWidth maxWidth="m">
                <form action={async (formData) => {
                    "use server";
                    const query = formData.get("q")?.toString();
                    if (query) {
                        redirect(`/search?q=${encodeURIComponent(query)}`);
                    }
                }}>
                    <Flex gap="16" fillWidth>
                        <Input
                            id="search-input"
                            name="q"
                            defaultValue={q}
                            placeholder="Search by title..."
                            label="Search"
                        />
                        <Button type="submit" variant="primary">Search</Button>
                    </Flex>
                </form>
            </Column>

            <Grid
                fillWidth
                maxWidth="xl"
                gap="32"
                s={{ columns: "1" }}
                style={{ gridTemplateColumns: "1fr 3fr" }}
            >
                {/* Filters Sidebar */}
                <Column>
                    <SearchFilters genres={genres.data || []} />
                </Column>

                {/* Results */}
                <Column fillWidth gap="16">
                    <Text variant="body-default-s" onBackground="neutral-weak">
                        Found {mangaList.meta.total_record} results
                    </Text>

                    {mangaList.data && mangaList.data.length > 0 ? (
                        <Grid style={{ gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))" }} gap="16">
                            {mangaList.data.map((manga) => (
                                <MangaCard key={manga.manga_id} manga={manga} />
                            ))}
                        </Grid>
                    ) : (
                        <Flex fillWidth padding="64" horizontal="center" vertical="center">
                            <Text variant="body-default-l" onBackground="neutral-weak">No results found</Text>
                        </Flex>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <Flex fillWidth horizontal="center" gap="16" paddingY="32">
                            <Button
                                variant="secondary"
                                disabled={page <= 1}
                                href={`/search?${new URLSearchParams({ ...params, page: String(page - 1) }).toString()}`}
                            >
                                Previous
                            </Button>
                            <Text variant="body-default-m" style={{ alignSelf: 'center' }}>
                                Page {page} of {totalPages}
                            </Text>
                            <Button
                                variant="secondary"
                                disabled={page >= totalPages}
                                href={`/search?${new URLSearchParams({ ...params, page: String(page + 1) }).toString()}`}
                            >
                                Next
                            </Button>
                        </Flex>
                    )}
                </Column>
            </Grid>
        </Column>
    );
}
