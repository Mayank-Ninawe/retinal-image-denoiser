import cv2
import numpy as np
from scipy.ndimage import median_filter
from skimage.metrics import peak_signal_noise_ratio as psnr, structural_similarity as ssim

class NoiseRemovalFilters:
    """Denoising filters ka collection"""
    
    @staticmethod
    def median_filter(img, kernel_size=5):
        """Standard Median Filter"""
        return cv2.medianBlur(img, kernel_size)
    
    @staticmethod
    def adaptive_median_filter(img, window_size=5):
        """Adaptive Median Filter (scipy)"""
        result = median_filter(img, size=window_size).astype(np.uint8)
        return result
    
    @staticmethod
    def bilateral_filter(img, d=9, sigma_color=75, sigma_space=75):
        """Bilateral Filter (edge-preserving)"""
        return cv2.bilateralFilter(img, d, sigma_color, sigma_space)
    
    @staticmethod
    def morphological_filter(img, kernel_size=5):
        """Morphological Opening + Closing"""
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (kernel_size, kernel_size))
        opening = cv2.morphologyEx(img, cv2.MORPH_OPEN, kernel)
        closing = cv2.morphologyEx(opening, cv2.MORPH_CLOSE, kernel)
        return closing
    
    @staticmethod
    def wiener_filter(img, window_size=5):
        """Wiener Filter (noise variance reduction)"""
        from scipy.ndimage import uniform_filter, variance
        
        # Local mean
        local_mean = uniform_filter(img.astype(float), size=window_size)
        
        # Local variance
        local_sq_mean = uniform_filter(img.astype(float)**2, size=window_size)
        local_var = local_sq_mean - local_mean**2
        
        # Global variance (estimate)
        global_var = np.var(img)
        
        # Wiener filter formula
        result = local_mean + (np.maximum(local_var - global_var, 0) / np.maximum(local_var, 1e-5)) * (img.astype(float) - local_mean)
        
        return np.clip(result, 0, 255).astype(np.uint8)
    
    @staticmethod
    def calculate_metrics(original, denoised):
        """PSNR और SSIM calculate karo"""
        try:
            psnr_val = float(psnr(original, denoised, data_range=255))
            ssim_val = float(ssim(original, denoised, data_range=255))
            return {'psnr': psnr_val, 'ssim': ssim_val}
        except Exception as e:
            return {'psnr': 0, 'ssim': 0, 'error': str(e)}

print("✅ Filters module loaded successfully!")
