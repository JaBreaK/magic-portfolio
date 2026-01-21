import { Flex } from "@once-ui-system/core";
import { CSSProperties } from "react";

interface SmartImageProps {
    src: string;
    alt: string;
    aspectRatio?: string;
    radius?: string;
    objectFit?: "cover" | "contain";
    fillWidth?: boolean;
    loading?: "lazy" | "eager";
    style?: CSSProperties;
    className?: string;
}

export const SmartImage = ({ src, alt, aspectRatio, radius, objectFit, fillWidth, loading, style, className }: SmartImageProps) => {
    return (
        <Flex
            fillWidth={fillWidth}
            className={className}
            style={{
                aspectRatio,
                overflow: 'hidden',
                borderRadius: radius ? `var(--radius-${radius})` : undefined,
                position: 'relative',
                width: fillWidth ? '100%' : undefined
            }}
        >
            <img
                src={src}
                alt={alt}
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: objectFit || 'cover',
                    display: 'block',
                    ...style
                }}
                loading={loading}
            />
        </Flex>
    );
};
