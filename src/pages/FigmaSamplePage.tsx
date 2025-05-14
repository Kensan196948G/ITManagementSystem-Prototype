import * as React from 'react';
import FigmaViewer from '../components/figma/FigmaViewer';
import { AppLayout } from '../components/layout/AppLayout';

const FigmaSamplePage: React.FC = () => {
    return (
        <AppLayout>
            <div className="p-8">
                <h1 className="text-2xl font-bold mb-6">Figmaデザインサンプル</h1>
                <div className="grid gap-8">
                    <FigmaViewer
                        figmaUrl="https://www.figma.com/file/YOUR_FIGMA_FILE_ID/SAMPLE?node-id=0%3A1"
                        fallbackImage="/images/figma-fallback.png"
                        altText="IT管理システム WebUIサンプル"
                        width="100%"
                        height="600px"
                    />
                    <div className="bg-gray-100 p-4 rounded-lg">
                        <h2 className="text-xl font-semibold mb-2">デザイン説明</h2>
                        <p className="text-gray-700">
                            これはIT管理システムのWebUIデザインサンプルです。Figmaで作成されたデザインを確認できます。
                        </p>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};

export default FigmaSamplePage;