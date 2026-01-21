"use client";

import React from 'react';
import { Column, Flex, Text, Button, SegmentedControl, Input } from "@once-ui-system/core";

export type ReadingMode = 'webtoon' | 'single';
export type ReadingDirection = 'ltr' | 'rtl';
export type ImageFit = 'width' | 'height';

export interface ReaderSettingsState {
    mode: ReadingMode;
    direction: ReadingDirection;
    fit: ImageFit;
    scrollSpeed: number;
    zoom: number;
}

interface ReaderSettingsProps {
    settings: ReaderSettingsState;
    onUpdate: (settings: ReaderSettingsState) => void;
}

export const ReaderSettings = ({ settings, onUpdate }: ReaderSettingsProps) => {
    const handleModeChange = (mode: string) => {
        onUpdate({ ...settings, mode: mode as ReadingMode });
    };

    const handleDirectionChange = (direction: string) => {
        onUpdate({ ...settings, direction: direction as ReadingDirection });
    };

    const handleFitChange = (fit: string) => {
        onUpdate({ ...settings, fit: fit as ImageFit });
    };

    const handleSpeedChange = (speed: string) => {
        onUpdate({ ...settings, scrollSpeed: Number(speed) });
    };

    const handleZoomChange = (zoom: number) => {
        onUpdate({ ...settings, zoom });
    };

    return (
        <Column gap="24" padding="16">
            <Column gap="8">
                <Text variant="body-strong-s" onBackground="neutral-weak">Reading Mode</Text>
                <SegmentedControl
                    buttons={[
                        { label: 'Webtoon', value: 'webtoon', prefixIcon: 'scroll' },
                        { label: 'Single Page', value: 'single', prefixIcon: 'page' }
                    ]}
                    selected={settings.mode}
                    onToggle={handleModeChange}
                />
            </Column>

            {settings.mode === 'webtoon' && (
                <>
                    <Column gap="8">
                        <Text variant="body-strong-s" onBackground="neutral-weak">Zoom ({settings.zoom || 100}%)</Text>
                        <Flex gap="8" vertical="center">
                            <Button
                                variant="secondary"
                                size="s"
                                onClick={() => handleZoomChange(Math.max((settings.zoom || 100) - 10, 50))}
                                disabled={(settings.zoom || 100) <= 50}
                            >
                                -
                            </Button>
                            <Input
                                id="zoom-slider"
                                type="range"
                                min={50}
                                max={200}
                                step={10}
                                value={settings.zoom || 100}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleZoomChange(Number(e.target.value))}
                                style={{ flex: 1 }}
                                label="Zoom"
                            />
                            <Button
                                variant="secondary"
                                size="s"
                                onClick={() => handleZoomChange(Math.min((settings.zoom || 100) + 10, 200))}
                                disabled={(settings.zoom || 100) >= 200}
                            >
                                +
                            </Button>
                        </Flex>
                    </Column>

                    <Column gap="8">
                        <Text variant="body-strong-s" onBackground="neutral-weak">Auto Scroll Speed (px/frame)</Text>
                        <Input
                            id="scroll-speed-input"
                            type="number"
                            value={settings.scrollSpeed || 1}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSpeedChange(e.target.value)}
                            min={1}
                            max={50}
                            label="Speed"
                            hasPrefix={<Text variant="body-default-s" onBackground="neutral-weak">x</Text>}
                        />
                    </Column>
                </>
            )}

            {settings.mode === 'single' && (
                <Column gap="8">
                    <Text variant="body-strong-s" onBackground="neutral-weak">Direction</Text>
                    <SegmentedControl
                        buttons={[
                            { label: 'Left to Right', value: 'ltr', prefixIcon: 'arrowRight' },
                            { label: 'Right to Left', value: 'rtl', prefixIcon: 'arrowLeft' }
                        ]}
                        selected={settings.direction}
                        onToggle={handleDirectionChange}
                    />
                </Column>
            )}

            <Column gap="8">
                <Text variant="body-strong-s" onBackground="neutral-weak">Image Fit</Text>
                <SegmentedControl
                    buttons={[
                        { label: 'Fit Width', value: 'width', prefixIcon: 'arrowsExpand' },
                        { label: 'Fit Height', value: 'height', prefixIcon: 'arrowsExpandVertical' }
                    ]}
                    selected={settings.fit}
                    onToggle={handleFitChange}
                />
            </Column>
        </Column>
    );
};
