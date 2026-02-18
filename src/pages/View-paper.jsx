import React, { useState } from 'react';

const ViewPaper = () => {
    const paperUrl = localStorage.getItem('currentPaper')
  const imageUrl = paperUrl 
//   console.log(imageUrl);
  const [zoom, setZoom] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 10, 200));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 10, 50));
  };

  const handleResetZoom = () => {
    setZoom(100);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className="w-full h-screen bg-gray-900 flex flex-col">
      {/* Header with Controls */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
        <h1 className="text-white text-xl font-semibold">Paper Viewer</h1>
        <div className="flex items-center gap-4">
          {/* Zoom Controls */}
          <div className="flex items-center gap-2 bg-gray-700 px-4 py-2 rounded-lg">
            <button
              onClick={handleZoomOut}
              className="text-white hover:text-blue-400 transition p-1"
              title="Zoom Out"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
              </svg>
            </button>
            <span className="text-white min-w-12 text-center">{zoom}%</span>
            <button    
              onClick={handleZoomIn}
              className="text-white hover:text-blue-400 transition p-1"
              title="Zoom In"
            >   
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
              </svg>
            </button>
            <button
              onClick={handleResetZoom}
              className="text-white hover:text-blue-400 transition px-2 py-1 text-sm rounded hover:bg-gray-600"
              title="Reset Zoom"
            >
              Reset
            </button>
          </div>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="text-white hover:text-blue-400 transition p-2 hover:bg-gray-700 rounded"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Image Display Area */}
      <div className="flex-1 overflow-auto flex items-center justify-center bg-black relative">
        <div className="flex items-center justify-center min-h-full">
          <img
            src={imageUrl}
            alt="Paper Document"
            style={{
              transform: `scale(${zoom / 100})`,
              maxHeight: '90vh',
              maxWidth: '95vw',
              objectFit: 'contain',
              transition: 'transform 0.3s ease-out'
            }}
            className="shadow-2xl"
            loading="lazy"
          />
        </div>
      </div>

      {/* Footer with Info */}
      <div className="bg-gray-800 border-t border-gray-700 px-6 py-3 text-gray-400 text-sm flex justify-between">
        <span>Paper Document Viewer</span>
        <span>Use scroll wheel or buttons to zoom in/out</span>
      </div>
    </div>
  );
};

export default ViewPaper;
