import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Upload, Download, Loader, Zap, Activity } from 'lucide-react';
import './App.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function App() {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [denoisedImages, setDenoisedImages] = useState({});
  const [selectedFilter, setSelectedFilter] = useState('median');
  const [kernelSize, setKernelSize] = useState(5);
  const [loading, setLoading] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [imageStats, setImageStats] = useState(null);
  const [availableFilters, setAvailableFilters] = useState([]);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isAnimated, setIsAnimated] = useState(false);

  // Fetch available filters on mount
  useEffect(() => {
    fetchAvailableFilters();
    setIsAnimated(true);
  }, []);

  // Particle background effect
  useEffect(() => {
    const createParticle = () => {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.left = Math.random() * 100 + '%';
      particle.style.animationDuration = (Math.random() * 3 + 2) + 's';
      particle.style.opacity = Math.random() * 0.5 + 0.2;
      document.querySelector('.particle-container')?.appendChild(particle);
      
      setTimeout(() => particle.remove(), 5000);
    };

    const interval = setInterval(createParticle, 300);
    return () => clearInterval(interval);
  }, []);

  const fetchAvailableFilters = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/filters/list`);
      if (response.data.success) {
        setAvailableFilters(response.data.filters);
      }
    } catch (error) {
      console.error('Error fetching filters:', error);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      setLoading(true);
      const response = await axios.post(`${API_BASE}/api/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        setUploadedImage(`data:image/jpeg;base64,${response.data.image_b64}`);
        setDenoisedImages({});
        setShowComparison(false);
        
        // Analyze image
        analyzeImage(response.data.image_b64);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('❌ Image upload failed');
    } finally {
      setLoading(false);
    }
  };

  const analyzeImage = async (imageB64) => {
    try {
      const response = await axios.post(`${API_BASE}/api/analyze`, {
        image_b64: imageB64
      });

      if (response.data.success) {
        setImageStats(response.data.statistics);
      }
    } catch (error) {
      console.error('Analysis error:', error);
    }
  };

  const handleDenoise = async () => {
    if (!uploadedImage) {
      alert('❌ Please upload an image first');
      return;
    }

    try {
      setLoading(true);
      const imageData = uploadedImage.split(',')[1];
      
      const response = await axios.post(`${API_BASE}/api/denoise`, {
        image_b64: imageData,
        filter_type: selectedFilter,
        kernel_size: kernelSize
      });

      if (response.data.success) {
        setDenoisedImages({
          [selectedFilter]: `data:image/jpeg;base64,${response.data.denoised_b64}`
        });
      }
    } catch (error) {
      console.error('Denoise error:', error);
      alert('❌ Denoising failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCompare = async () => {
    if (!uploadedImage) {
      alert('❌ Please upload an image first');
      return;
    }

    try {
      setLoading(true);
      const imageData = uploadedImage.split(',')[1];
      
      const response = await axios.post(`${API_BASE}/api/compare`, {
        image_b64: imageData
      });

      if (response.data.success) {
        const convertedResults = {};
        Object.entries(response.data.results).forEach(([key, val]) => {
          convertedResults[key] = `data:image/jpeg;base64,${val}`;
        });
        setDenoisedImages(convertedResults);
        setShowComparison(true);
      }
    } catch (error) {
      console.error('Comparison error:', error);
      alert('❌ Comparison failed');
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = (imgData, name) => {
    const link = document.createElement('a');
    link.href = imgData;
    link.download = `${name}_denoised.jpg`;
    link.click();
  };

  const getFilterColor = (filterName) => {
    const colors = {
      'median': 'cyan',
      'adaptive': 'purple',
      'bilateral': 'pink',
      'morphological': 'yellow',
      'wiener': 'green'
    };
    return colors[filterName] || 'cyan';
  };

  const getFilterBadgeClass = (filterName) => {
    const classes = {
      'median': 'filter-badge-cyan',
      'adaptive': 'filter-badge-purple',
      'bilateral': 'filter-badge-pink',
      'morphological': 'filter-badge-yellow',
      'wiener': 'filter-badge-green'
    };
    return classes[filterName] || 'filter-badge-cyan';
  };

  const handleButtonClick = (e, callback) => {
    // Ripple effect
    const button = e.currentTarget;
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.classList.add('ripple');
    
    button.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
    
    if (callback) callback();
  };

  return (
    <div className="app-container">
      {/* Particle Background */}
      <div className="particle-container"></div>
      
      <div className="content-wrapper">
        {/* Animated Header */}
        <div className={`header ${isAnimated ? 'fade-in' : ''}`}>
          <div className="header-content">
            <Activity className="header-icon pulse" />
            <h1 className="gradient-text">
              Retinal Image Denoiser
            </h1>
            <Activity className="header-icon pulse" />
          </div>
          <div className="glow-line"></div>
          <p className="header-subtitle">
            🔬 Advanced Medical Imaging • Remove Salt-and-Pepper Noise • AI-Powered Spatial Filters
          </p>
        </div>

        {/* Main Container */}
        <div className={`main-grid ${isAnimated ? 'fade-in-delay' : ''}`}>
          {/* Upload Section */}
          <div className="glass-card upload-card hover-glow">
            <h2 className="card-title">
              <Upload className="title-icon" />
              Upload Image
            </h2>
            <label className="upload-zone">
              <Upload className="upload-icon" />
              <p className="upload-text">Click to upload</p>
              <p className="upload-subtext">PNG, JPG, JPEG</p>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="upload-input"
              />
            </label>
            {uploadedImage && (
              <div className="uploaded-preview">
                <div className="image-wrapper zoom-hover">
                  <img src={uploadedImage} alt="Uploaded" className="preview-image" />
                </div>
                {imageStats && (
                  <div className="stats-panel">
                    <p className="stats-title">📊 Image Statistics</p>
                    <div className="stat-item">
                      <span className="stat-label">Mean:</span>
                      <span className="stat-value animated-counter">{imageStats.mean.toFixed(2)}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Std Dev:</span>
                      <span className="stat-value animated-counter">{imageStats.std.toFixed(2)}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Blur Score:</span>
                      <span className="stat-value animated-counter">{imageStats.blur_score.toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Controls Section */}
          <div className="glass-card controls-card hover-glow">
            <h2 className="card-title">
              <Zap className="title-icon" />
              Denoise Settings
            </h2>
            
            <div className="control-group">
              <label className="control-label">
                Filter Type
              </label>
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="select-input"
              >
                {availableFilters.map(filter => (
                  <option key={filter.name} value={filter.name}>
                    {filter.name.charAt(0).toUpperCase() + filter.name.slice(1)} - {filter.description}
                  </option>
                ))}
              </select>
              <div className="filter-badges">
                {availableFilters.map(filter => (
                  <span 
                    key={filter.name} 
                    className={`filter-badge ${getFilterBadgeClass(filter.name)} ${selectedFilter === filter.name ? 'active' : ''}`}
                    onClick={() => setSelectedFilter(filter.name)}
                  >
                    {filter.name}
                  </span>
                ))}
              </div>
            </div>

            {['median', 'adaptive', 'morphological', 'wiener'].includes(selectedFilter) && (
              <div className="control-group">
                <label className="control-label">
                  Kernel Size: <span className="kernel-value">{kernelSize}</span>
                </label>
                <input
                  type="range"
                  min="3"
                  max="15"
                  step="2"
                  value={kernelSize}
                  onChange={(e) => setKernelSize(parseInt(e.target.value))}
                  className="range-input"
                />
                <p className="control-hint">Adjust for different noise levels</p>
              </div>
            )}

            <div className="button-group">
              <button
                onClick={(e) => handleButtonClick(e, handleDenoise)}
                disabled={loading || !uploadedImage}
                className="btn btn-primary"
              >
                {loading && <Loader className="btn-icon spin" />}
                {!loading && <Zap className="btn-icon" />}
                Apply Filter
              </button>
              <button
                onClick={(e) => handleButtonClick(e, handleCompare)}
                disabled={loading || !uploadedImage}
                className="btn btn-secondary"
              >
                <Activity className="btn-icon" />
                Compare All Filters
              </button>
            </div>
          </div>
        </div>

        {/* Results Section - Single Filter */}
        {Object.keys(denoisedImages).length > 0 && !showComparison && (
          <div className="glass-card results-card hover-glow fade-in">
            <div className="results-header">
              <h2 className="card-title">
                ✅ Denoised Result
                <span className={`filter-badge ${getFilterBadgeClass(selectedFilter)}`}>
                  {selectedFilter}
                </span>
              </h2>
              <button
                onClick={(e) => handleButtonClick(e, () => downloadImage(Object.values(denoisedImages)[0], selectedFilter))}
                className="btn btn-success"
              >
                <Download className="btn-icon" />
                Download
              </button>
            </div>
            
            {/* Image Comparison Slider */}
            <div className="comparison-container">
              <div className="comparison-wrapper">
                <div className="comparison-image-container">
                  <img src={uploadedImage} alt="Original" className="comparison-image" />
                  <div className="image-label original-label">Original</div>
                </div>
                <div 
                  className="comparison-image-container denoised-container"
                  style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                >
                  <img src={Object.values(denoisedImages)[0]} alt="Denoised" className="comparison-image" />
                  <div className="image-label denoised-label">{selectedFilter} Filtered</div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sliderPosition}
                  onChange={(e) => setSliderPosition(e.target.value)}
                  className="comparison-slider"
                />
                <div 
                  className="slider-line"
                  style={{ left: `${sliderPosition}%` }}
                >
                  <div className="slider-handle"></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Comparison Section - All Filters */}
        {showComparison && Object.keys(denoisedImages).length > 0 && (
          <div className="glass-card comparison-grid-card fade-in">
            <h2 className="card-title centered">
              🔍 Filter Comparison
            </h2>
            <div className="comparison-grid">
              {/* Original */}
              <div className="comparison-item">
                <div className="comparison-image-wrapper zoom-hover">
                  <img src={uploadedImage} alt="Original" className="grid-image" />
                  <div className="image-overlay">
                    <span className="overlay-text">Original</span>
                  </div>
                </div>
                <p className="comparison-label">Original Image</p>
              </div>

              {/* All Filters */}
              {Object.entries(denoisedImages).map(([filterName, imgData]) => (
                <div key={filterName} className="comparison-item">
                  <div className="comparison-image-wrapper zoom-hover">
                    <img src={imgData} alt={filterName} className="grid-image" />
                    <div className="image-overlay">
                      <span className="overlay-text">{filterName}</span>
                    </div>
                  </div>
                  <div className="comparison-footer">
                    <span className={`filter-badge ${getFilterBadgeClass(filterName)}`}>
                      {filterName}
                    </span>
                    <button
                      onClick={(e) => handleButtonClick(e, () => downloadImage(imgData, filterName))}
                      className="download-mini-btn"
                    >
                      <Download className="mini-icon" />
                      Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Loading Overlay */}
        {loading && (
          <div className="loading-overlay">
            <div className="loading-spinner">
              <div className="spinner-ring"></div>
              <div className="spinner-ring"></div>
              <div className="spinner-ring"></div>
            </div>
            <p className="loading-text">Processing...</p>
          </div>
        )}

        {/* Footer */}
        <div className="footer">
          <p className="footer-text">
            🔬 Built for retinal image denoising | Powered by OpenCV & Scipy | Premium Medical Imaging UI
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
