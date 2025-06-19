'use client';

import { Worker, Viewer } from '@react-pdf-viewer/core';
import type { DocumentLoadEvent, PdfJs } from '@react-pdf-viewer/core';
import { dropPlugin } from '@react-pdf-viewer/drop';
import { themePlugin } from '@react-pdf-viewer/theme';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import { highlightPlugin, Trigger, type HighlightArea, type RenderHighlightsProps } from '@react-pdf-viewer/highlight';
import { useState } from 'react';

// Import styles
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/drop/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import '@react-pdf-viewer/highlight/lib/styles/index.css';

interface BoundingBox {
  page: number;
  bbox: [number, number, number, number];  // [min_x, min_y, max_x, max_y]
  pageHeight: number;
}

export default function Home() {
  const [boundingBoxes, setBoundingBoxes] = useState<string>('[{ "page": 0, "bbox": [0.0, 0.0, 612.0, 792.0], "pageHeight": 792 }]');
  const [currentFile] = useState<string>('./attention_is_all_you_need.pdf');
  const [areas, setAreas] = useState<HighlightArea[]>([]);
  const [pageHeight, setPageHeight] = useState<number>(792);
  const [pageWidth, setPageWidth] = useState<number>(612);

  const getColorByIndex = () => {
    return "yellow";
  };

  const handleDocumentLoad = (e: DocumentLoadEvent) => {
    e.doc.getPage(1).then((page: PdfJs.Page) => {
      const viewport = page.getViewport({ scale: 1 });
      setPageHeight(viewport.height);
      setPageWidth(viewport.width)
    });
  };

  const renderHighlights = (props: RenderHighlightsProps) => (
    <div>
      {areas
        .filter((area) => area.pageIndex === props.pageIndex)
        .map((area, idx) => (
          <div
            key={idx}
            className="highlight-area"
            style={{
              background: getColorByIndex(),
              opacity: 0.4,
              ...props.getCssProperties(area, props.rotation)
            }}
          />
        ))}
    </div>
  );

  const highlightPluginInstance = highlightPlugin({
    renderHighlights,
    trigger: Trigger.None,
  });
  const { jumpToHighlightArea } = highlightPluginInstance;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const boxes = JSON.parse(boundingBoxes) as BoundingBox[];
      const highlightAreas: HighlightArea[] = boxes.map((box) => {
        const [min_x, min_y, max_x, max_y] = box.bbox;

        // Convert to percentages
        return {
          pageIndex: box.page,
          left: (min_x / pageWidth) * 100,
          top: (min_y / pageHeight) * 100,
          width: ((max_x - min_x) / pageWidth) * 100,
          height: ((max_y - min_y) / pageHeight) * 100
        };
      });
      console.log(highlightAreas);
      setAreas(highlightAreas);
      jumpToHighlightArea(highlightAreas[0]);
    } catch (error) {
      console.error('Invalid JSON format:', error);
    }
  };

  const dropPluginInstance = dropPlugin();
  const defaultLayoutPluginInstance = defaultLayoutPlugin();
  const themePluginInstance = themePlugin();

  return (
    <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
      <div className="flex h-screen">
        <div className="w-2/3 h-full overflow-auto">
          <Viewer
            fileUrl={currentFile}
            onDocumentLoad={handleDocumentLoad}
            plugins={[dropPluginInstance, defaultLayoutPluginInstance, themePluginInstance, highlightPluginInstance]}
          />
        </div>

        <div className="w-1/3 h-full bg-white border-l border-gray-200 shadow-lg">
          <div className="p-6 h-64 flex flex-col">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Bounding Boxes</h2>
            <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
              <div className="flex-1">
                <label htmlFor="boundingBoxes" className="block text-sm font-medium text-gray-700 mb-2">
                  Enter JSON Format
                </label>
                <textarea
                  id="boundingBoxes"
                  value={boundingBoxes}
                  onChange={(e) => setBoundingBoxes(e.target.value)}
                  className="w-full min-h-[300px] p-4 text-sm font-mono bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500"
                  placeholder='[{ "pageIndex": 0, "bbox": [0.0, 0.0, 612.0, 792.0], "pageHeight": 792 }]'
                  style={{ color: "#222" }}
                />
              </div>
              <div className="mt-6">
                <button
                  type="submit"
                  className="w-full px-4 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-medium transition-colors"
                >
                  Apply Bounding Boxes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Worker>
  );
}
