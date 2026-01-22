"use client";

import { Column, Heading, Text, Button } from "@once-ui-system/core";

export default function OfflinePage() {
    return (
        <Column fillWidth paddingY="128" horizontal="center" gap="32">
            <Heading variant="display-strong-l">You are Offline</Heading>
            <Text variant="body-default-l" onBackground="neutral-weak">
                It seems you lost your internet connection.
            </Text>
            <Text variant="body-default-m" onBackground="neutral-weak">
                Please check your connection and try again.
            </Text>
            <Button
                variant="primary"
                onClick={() => window.location.href = '/library'}
            >
                Go to My Downloads
            </Button>
            <Button
                variant="secondary"
                onClick={() => window.location.reload()}
            >
                Reload Page
            </Button>
        </Column>
    );
}
