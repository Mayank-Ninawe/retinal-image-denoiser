import React, { useState } from 'react';
import axios from 'axios';
import { Upload, Download, Loader, Zap } from 'lucide-react';


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

  // Fetch available filters on mount
  React.useEffect(() => {
    fetchAvailableFilters();
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Zap className="w-10 h-10 text-blue-600" />
            <h1 className="text-4xl md:text-5xl font-bold text-blue-900">
              Retinal Image Denoiser
            </h1>
            <Zap className="w-10 h-10 text-blue-600" />
          </div>
          <p className="text-blue-700 text-lg">
            🔬 Remove salt-and-pepper noise using adaptive spatial filters
          </p>
        </div>

        {/* Main Container */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Upload Section */}
          <div className="lg:col-span-1 bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition">
            <h2 className="text-2xl font-bold text-blue-900 mb-6">📤 Upload Image</h2>
            <label className="flex flex-col items-center justify-center w-full p-8 border-2 border-dashed border-blue-400 rounded-lg cursor-pointer hover:bg-blue-50 transition">
              <Upload className="w-12 h-12 text-blue-500 mb-2" />
              <p className="text-blue-700 font-semibold">Click to upload</p>
              <p className="text-blue-500 text-sm">PNG, JPG, JPEG</p>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
            {uploadedImage && (
              <div className="mt-6">
                <img src={uploadedImage} alt="Uploaded" className="w-full rounded-lg shadow" />
                {imageStats && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg text-sm">
                    <p className="text-blue-900 font-semibold">Image Stats:</p>
                    <p className="text-blue-700">Mean: {imageStats.mean.toFixed(2)}</p>
                    <p className="text-blue-700">Std Dev: {imageStats.std.toFixed(2)}</p>
                    <p className="text-blue-700">Blur Score: {imageStats.blur_score.toFixed(2)}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Controls Section */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition">
            <h2 className="text-2xl font-bold text-blue-900 mb-6">⚙️ Denoise Settings</h2>
            
            <div className="mb-6">
              <label className="block text-blue-900 font-semibold mb-3">
                Filter Type
              </label>
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="w-full p-3 border-2 border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              >
                {availableFilters.map(filter => (
                  <option key={filter.name} value={filter.name}>
                    {filter.name.charAt(0).toUpperCase() + filter.name.slice(1)} - {filter.description}
                  </option>
                ))}
              </select>
              <p className="text-blue-600 text-sm mt-2">
                {availableFilters.find(f => f.name === selectedFilter)?.description}
              </p>
            </div>

            {['median', 'adaptive', 'morphological', 'wiener'].includes(selectedFilter) && (
              <div className="mb-8">
                <label className="block text-blue-900 font-semibold mb-3">
                  Kernel Size: <span className="text-blue-600">{kernelSize}</span>
                </label>
                <input
                  type="range"
                  min="3"
                  max="15"
                  step="2"
                  value={kernelSize}
                  onChange={(e) => setKernelSize(parseInt(e.target.value))}
                  className="w-full accent-blue-600"
                />
                <p className="text-blue-600 text-xs mt-2">Adjust for different noise levels</p>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <button
                onClick={handleDenoise}
                disabled={loading || !uploadedImage}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading && <Loader className="w-5 h-5 animate-spin" />}
                Apply Filter
              </button>
              <button
                onClick={handleCompare}
                disabled={loading || !uploadedImage}
                className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Compare All Filters
              </button>
            </div>
          </div>
        </div>

        {/* Results Section */}
        {Object.keys(denoisedImages).length > 0 && !showComparison && (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-blue-900">✅ Denoised Result</h2>
              <button
                onClick={() => downloadImage(Object.values(denoisedImages)[0], selectedFilter)}
                className="flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
              >
                <Download className="w-5 h-5" />
                Download
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-blue-900 font-semibold mb-3 text-center">Original</p>
                <img src={uploadedImage} alt="Original" className="w-full rounded-lg shadow" />
              </div>
              <div>
                <p className="text-blue-900 font-semibold mb-3 text-center capitalize">
                  {selectedFilter} Filtered
                </p>
                <img src={Object.values(denoisedImages)[0]} alt="Denoised" className="w-full rounded-lg shadow" />
              </div>
            </div>
          </div>
        )}

        {/* Comparison Section */}
        {showComparison && Object.keys(denoisedImages).length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-blue-900 mb-8 text-center">
              🔍 Filter Comparison
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Original */}
              <div className="text-center">
                <div className="bg-gray-50 p-2 rounded-lg mb-3">
                  <img src={uploadedImage} alt="Original" className="w-full rounded h-48 object-cover" />
                </div>
                <p className="text-blue-900 font-bold">Original Image</p>
              </div>

              {/* All Filters */}
              {Object.entries(denoisedImages).map(([filterName, imgData]) => (
                <div key={filterName} className="text-center">
                  <div className="bg-blue-50 p-2 rounded-lg mb-3 hover:shadow-md transition">
                    <img src={imgData} alt={filterName} className="w-full rounded h-48 object-cover" />
                  </div>
                  <p className="text-blue-900 font-bold capitalize">{filterName}</p>
                  <button
                    onClick={() => downloadImage(imgData, filterName)}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-semibold"
                  >
                    ⬇ Download
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-12 text-blue-600">
          <p className="text-sm">🔬 Built for retinal image denoising | Powered by OpenCV & Scipy</p>
        </div>
      </div>
    </div>
  );
}

export default App;
