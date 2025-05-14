import * as React from 'react';
import ImageWithFallback from './ImageWithFallback';

interface FigmaViewerProps {
    figmaUrl: string;
    fallbackImage: string;
    altText: string;
    className?: string;
    width?: number | string;
    height?: number | string;
}

const FigmaViewer: React.FC<FigmaViewerProps> = ({
    figmaUrl,
    fallbackImage,
    altText,
    className = '',
    width = '100%',
    height = 'auto',
}: FigmaViewerProps) => {
    // Figmaの埋め込みURLを生成
    const embedUrl = figmaUrl.includes('embed')
        ? figmaUrl
        : `https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(figmaUrl)}`;

    return (
        <div className={`figma-viewer ${className}`}>
            <iframe
                src={embedUrl}
                width={width}
                height={height}
                allowFullScreen
                title={altText}
                style={{ border: 'none' }}
            />
            <ImageWithFallback
                src={fallbackImage}
                fallbackSrc={fallbackImage}
                alt={altText}
                className="figma-fallback"
                width={width}
                height={height}
            />
        </div>
    );
};

export default FigmaViewer;