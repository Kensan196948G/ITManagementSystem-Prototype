import React, { FC, ReactEventHandler } from 'react';

interface FigmaViewerProps {
    url: string;
    className?: string | null;
    onError?: ReactEventHandler<HTMLIFrameElement>;
}

/**
 * FigmaViewerコンポーネント
 * 指定されたFigmaのURLをiframeで表示します。
 * classNameはnullish coalescing演算子で安全に扱い、onErrorイベントには型注釈を付与しています。
 */
const FigmaViewer: FC<FigmaViewerProps> = ({ url, className = null, onError }) => {
    return (
        <iframe
            src={url}
            className={className ?? undefined} // 修正ポイント: nullish coalescingでundefinedにして安全にclassNameを扱う
            onError={onError} // 修正ポイント: ReactEventHandler<HTMLIFrameElement>型を適用
            title="Figma Viewer"
            frameBorder="0"
            allowFullScreen
            style={{ width: '100%', height: '100%' }}
        />
    );
};

export default FigmaViewer;