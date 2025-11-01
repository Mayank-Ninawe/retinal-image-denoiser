
import cv2
import numpy as np
import os

class DRIVEDataLoader:
    def __init__(self, dataset_path='./datasets/DRIVE'):
        self.dataset_path = dataset_path
        self.training_images_path = os.path.join(dataset_path, 'training', 'images')
        self.test_images_path = os.path.join(dataset_path, 'test', 'images')
    
    def load_image(self, filename, image_type='training'):
        """Load DRIVE image"""
        if image_type == 'training':
            path = os.path.join(self.training_images_path, filename)
        else:
            path = os.path.join(self.test_images_path, filename)
        
        img = cv2.imread(path, cv2.IMREAD_GRAYSCALE)
        return img
    
    def get_all_training_images(self):
        """Get all training image names"""
        return sorted(os.listdir(self.training_images_path))
    
    def get_all_test_images(self):
        """Get all test image names"""
        return sorted(os.listdir(self.test_images_path))
    
    def load_batch(self, image_names, image_type='training'):
        """Load multiple images as batch"""
        batch = []
        for name in image_names:
            img = self.load_image(name, image_type)
            if img is not None:
                batch.append(img)
        return np.array(batch)
