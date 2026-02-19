import React, { useState, useRef } from 'react';

const SolvePaper = () => {
  const imageUrl = 'https://res.cloudinary.com/dc0eskzxx/image/upload/v1771091135/lcxp6c8amhdizq1sxgub.jpg';
  const [zoom, setZoom] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 10, 250));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 10, 50));
  };

  const handleResetZoom = () => {
    setZoom(100);
    setPanX(0);
    setPanY(0);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      handleZoomIn();
    } else {
      handleZoomOut();
    }
  };

  // const handleMouseDown = (e) => {
  //   if (zoom > 100) {
  //     setIsDragging(true);
  //     setDragStart({ x: e.clientX - panX, y: e.clientY - panY });
  //   }
  // };

  // const handleMouseMove = () => {
  //   if (isDragging && zoom > 100) {
  //     setPanX(e.clientX - dragStart.x);
  //     setPanY(e.clientY - dragStart.y);
  //   }
  // };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'paper.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Download failed. Please try again.');
    }
  };

  return (
    <div className="w-full h-screen bg-gray-900 flex flex-col overflow-hidden">
      {/* Header with Controls */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 border-b border-blue-700 px-6 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-white text-xl font-bold">Solve Paper</h1>
        </div>
        <div className="flex items-center gap-4">
          {/* Zoom Controls */}
          <div className="flex items-center gap-2 bg-blue-700 px-4 py-2 rounded-lg">
            <button
              onClick={handleZoomOut}
              className="text-white hover:text-yellow-300 transition p-1.5 hover:bg-blue-600 rounded"
              title="Zoom Out (Scroll Down)"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
              </svg>
            </button>
            <span className="text-white min-w-14 text-center font-semibold">{zoom}%</span>
            <button
              onClick={handleZoomIn}
              className="text-white hover:text-yellow-300 transition p-1.5 hover:bg-blue-600 rounded"
              title="Zoom In (Scroll Up)"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
              </svg>
            </button>
            <div className="w-px h-6 bg-blue-600"></div>
            <button
              onClick={handleResetZoom}
              className="text-white hover:text-yellow-300 transition px-3 py-1 text-sm rounded hover:bg-blue-600 font-medium"
              title="Reset Zoom & Position"
            >
              Reset
            </button>
          </div>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="text-white hover:text-yellow-300 transition p-2 hover:bg-blue-700 rounded"
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
      <div
        ref={containerRef}
        className="flex-1 overflow-hidden flex items-center justify-center bg-black relative cursor-grab active:cursor-grabbing"
        // onWheel={handleWheel}
        // onMouseDown={handleMouseDown}
        // onMouseMove={handleMouseMove}
        // onMouseUp={handleMouseUp}
        // onMouseLeave={handleMouseUp}
      >
        <div className="flex items-center justify-center w-full h-full">
          <img
            src={imageUrl}
            alt="Paper to Solve"
            style={{
              transform: `scale(${zoom / 100}) translate(${panX}px, ${panY}px)`,
              maxHeight: '90vh',
              maxWidth: '95vw',
              objectFit: 'contain',
              transition: isDragging ? 'none' : 'transform 0.3s ease-out',
              userSelect: 'none'
            }}
            className="shadow-2xl drop-shadow-xl"
            draggable={false}
            loading="lazy"
          />
        </div>

        {/* Zoom Level Indicator */}
        <div className="absolute bottom-20 right-6 bg-black bg-opacity-70 text-white px-4 py-2 rounded-lg text-sm font-medium">
          Zoom: {zoom}%
        </div>

        {/* Download Button - Desktop Only */}
        <button
          onClick={handleDownload}
          className="absolute right-6 top-1/2 transform -translate-y-1/2 hidden lg:flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg transition-all active:scale-95"
          title="Download Paper"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download
        </button>
      </div>
      {/* Footer with Instructions */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-800 border-t border-gray-700 px-6 py-4">
        <div className="flex justify-between items-center text-gray-300 text-sm">
          <div className="flex gap-6">
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.5 1.5H19V10.5" />
              </svg>
              Scroll to zoom
            </span>
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 4a6 6 0 100 12 6 6 0 000-12z" />
              </svg>
              Drag to pan
            </span>
          </div>
          <span className="font-semibold text-blue-400">Solve Paper Viewer - Zoom range: 50% - 250%</span>
        </div>
      </div>
    </div>
  );
};

export default SolvePaper;
