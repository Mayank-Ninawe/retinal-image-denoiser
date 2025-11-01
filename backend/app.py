from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import cv2
import numpy as np
from PIL import Image
import io
import base64
import os
from filters import NoiseRemovalFilters
from dotenv import load_dotenv
import traceback

load_dotenv()

app = Flask(__name__)
CORS(app)

# Create uploads folder
os.makedirs('uploads', exist_ok=True)

def convert_image_to_base64(img):
    """OpenCV image को base64 में convert करो"""
    if img is None:
        return None
    _, buffer = cv2.imencode('.jpg', img)
    return base64.b64encode(buffer).decode()

def convert_base64_to_image(image_b64):
    """Base64 को OpenCV image में convert करो"""
    try:
        image_data = base64.b64decode(image_b64)
        nparr = np.frombuffer(image_data, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_GRAYSCALE)
        return img
    except Exception as e:
        print(f"Error in base64 conversion: {e}")
        return None

# ==================== ROUTES ====================

@app.route('/', methods=['GET'])
def home():
    """Home route"""
    return jsonify({
        'message': 'Retinal Image Denoiser API',
        'version': '1.0',
        'status': 'running'
    }), 200

@app.route('/api/health', methods=['GET'])
def health():
    """Health check"""
    return jsonify({'status': 'API is running', 'message': 'All systems operational'}), 200

@app.route('/api/upload', methods=['POST'])
def upload_image():
    """Image upload करो"""
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No image provided', 'success': False}), 400
        
        file = request.files['image']
        
        if file.filename == '':
            return jsonify({'error': 'Empty filename', 'success': False}), 400
        
        # Read image
        image_stream = io.BytesIO(file.read())
        image = Image.open(image_stream).convert('L')  # Grayscale
        img_array = np.array(image, dtype=np.uint8)
        
        # Save uploaded image
        filename = f"uploaded_{file.filename}"
        filepath = os.path.join('uploads', filename)
        cv2.imwrite(filepath, img_array)
        
        return jsonify({
            'message': 'Image uploaded successfully',
            'image_size': list(img_array.shape),
            'filename': filename,
            'image_b64': convert_image_to_base64(img_array),
            'success': True
        }), 200
    
    except Exception as e:
        print(f"Upload error: {e}")
        print(traceback.format_exc())
        return jsonify({'error': str(e), 'success': False}), 500

@app.route('/api/denoise', methods=['POST'])
def denoise_image():
    """Apply denoising filter"""
    try:
        data = request.json
        image_b64 = data.get('image_b64')
        filter_type = data.get('filter_type', 'median')
        kernel_size = data.get('kernel_size', 5)
        
        if not image_b64:
            return jsonify({'error': 'No image data', 'success': False}), 400
        
        # Decode image
        img = convert_base64_to_image(image_b64)
        if img is None:
            return jsonify({'error': 'Failed to decode image', 'success': False}), 400
        
        # Apply filter
        filters = NoiseRemovalFilters()
        
        filter_map = {
            'median': lambda: filters.median_filter(img, kernel_size),
            'adaptive': lambda: filters.adaptive_median_filter(img, kernel_size),
            'bilateral': lambda: filters.bilateral_filter(img),
            'morphological': lambda: filters.morphological_filter(img, kernel_size),
            'wiener': lambda: filters.wiener_filter(img, kernel_size)
        }
        
        if filter_type not in filter_map:
            return jsonify({'error': f'Unknown filter: {filter_type}', 'success': False}), 400
        
        denoised = filter_map[filter_type]()
        
        return jsonify({
            'success': True,
            'denoised_b64': convert_image_to_base64(denoised),
            'filter_applied': filter_type,
            'message': f'{filter_type} filter applied successfully'
        }), 200
    
    except Exception as e:
        print(f"Denoise error: {e}")
        print(traceback.format_exc())
        return jsonify({'error': str(e), 'success': False}), 500

@app.route('/api/compare', methods=['POST'])
def compare_filters():
    """Compare all filters"""
    try:
        data = request.json
        image_b64 = data.get('image_b64')
        
        if not image_b64:
            return jsonify({'error': 'No image data', 'success': False}), 400
        
        # Decode image
        img = convert_base64_to_image(image_b64)
        if img is None:
            return jsonify({'error': 'Failed to decode image', 'success': False}), 400
        
        filters = NoiseRemovalFilters()
        results = {}
        
        # Apply all filters
        filter_configs = {
            'median': lambda: filters.median_filter(img, 5),
            'adaptive': lambda: filters.adaptive_median_filter(img, 5),
            'bilateral': lambda: filters.bilateral_filter(img),
            'morphological': lambda: filters.morphological_filter(img, 5),
            'wiener': lambda: filters.wiener_filter(img, 5)
        }
        
        for filter_name, filter_func in filter_configs.items():
            try:
                denoised = filter_func()
                results[filter_name] = convert_image_to_base64(denoised)
            except Exception as e:
                print(f"Error in {filter_name}: {e}")
                results[filter_name] = None
        
        return jsonify({
            'success': True,
            'results': results,
            'message': 'All filters applied successfully'
        }), 200
    
    except Exception as e:
        print(f"Comparison error: {e}")
        print(traceback.format_exc())
        return jsonify({'error': str(e), 'success': False}), 500

@app.route('/api/analyze', methods=['POST'])
def analyze_image():
    """Analyze image quality (noise estimation)"""
    try:
        data = request.json
        image_b64 = data.get('image_b64')
        
        if not image_b64:
            return jsonify({'error': 'No image data', 'success': False}), 400
        
        img = convert_base64_to_image(image_b64)
        if img is None:
            return jsonify({'error': 'Failed to decode image', 'success': False}), 400
        
        # Calculate image statistics
        mean = float(np.mean(img))
        std = float(np.std(img))
        min_val = int(np.min(img))
        max_val = int(np.max(img))
        
        # Laplacian variance (blurriness detection)
        laplacian = cv2.Laplacian(img, cv2.CV_64F)
        blur_score = float(np.var(laplacian))
        
        return jsonify({
            'success': True,
            'statistics': {
                'mean': mean,
                'std': std,
                'min': min_val,
                'max': max_val,
                'blur_score': blur_score
            },
            'message': 'Image analysis completed'
        }), 200
    
    except Exception as e:
        print(f"Analysis error: {e}")
        return jsonify({'error': str(e), 'success': False}), 500

@app.route('/api/filters/list', methods=['GET'])
def list_filters():
    """Available filters ka list"""
    return jsonify({
        'success': True,
        'filters': [
            {
                'name': 'median',
                'description': 'Standard Median Filter',
                'parameters': ['kernel_size']
            },
            {
                'name': 'adaptive',
                'description': 'Adaptive Median Filter',
                'parameters': ['window_size']
            },
            {
                'name': 'bilateral',
                'description': 'Bilateral Filter (Edge-Preserving)',
                'parameters': []
            },
            {
                'name': 'morphological',
                'description': 'Morphological Opening + Closing',
                'parameters': ['kernel_size']
            },
            {
                'name': 'wiener',
                'description': 'Wiener Filter',
                'parameters': ['window_size']
            }
        ]
    }), 200

# ==================== ERROR HANDLING ====================

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Route not found', 'success': False}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error', 'success': False}), 500

# ==================== MAIN ====================

if __name__ == '__main__':
    print("=" * 50)
    print("🚀 Retinal Image Denoiser API")
    print("=" * 50)
    print("Starting server...")
    print("URL: http://localhost:5000")
    print("=" * 50)
    app.run(debug=True, port=5000, host='0.0.0.0')
