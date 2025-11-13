# 🔬 Retinal Image Denoiser

**Salt-and-Pepper Noise Removal in Retinal Fundus Images using Spatial Filters**

🌐 **[Live Demo](https://retinal-image-denoiser.vercel.app/)** • 🚀 **[Backend API](https://retinal-image-denoiser-api.onrender.com)**

**Quick Links:** [About](#-about) • [Features](#-features) • [Quick Start](#-quick-start) • [Filters](#-filters--algorithms) • [API Docs](#-api-documentation)


***

## 🎯 About

A **production-ready web application** for removing salt-and-pepper noise from retinal fundus images while preserving critical vessel structures. Built with React, Flask, and OpenCV.

### Why This Matters

Retinal images are essential for diagnosing eye diseases like **Diabetic Retinopathy** and **Glaucoma**. Image noise can obscure diagnostic features—this tool removes noise while keeping vessel edges sharp for accurate analysis.

### Key Highlights

✅ **5 Spatial Filters** - Median, Adaptive Median, Bilateral, Morphological, Wiener  
✅ **Real-time Processing** - <100ms per image (565×584)  
✅ **Quality Metrics** - PSNR & SSIM calculation  
✅ **Comparison Mode** - Side-by-side filter analysis  
✅ **Production Ready** - Deployed on Vercel + Render

***

## ✨ Features

<table>
  <tr>
    <td width="50%">
      
### 🔬 Image Processing
- 5 advanced denoising algorithms
- Real-time filter application
- PSNR/SSIM quality metrics
- Batch comparison mode
- One-click download

    </td>
    <td width="50%">
      
### 🎨 User Experience
- Drag-and-drop upload
- Responsive design (mobile-ready)
- Dark mode interface
- Intuitive controls
- Instant visual feedback

    </td>
  </tr>
</table>

***

## 🛠️ Tech Stack

**Frontend:** React • Tailwind CSS • Axios • Vercel  
**Backend:** Python • Flask • OpenCV • NumPy • SciPy • Render  
**Dataset:** DRIVE (40 retinal fundus images, 565×584)

***

## 🚀 Quick Start

### Prerequisites
```bash
✅ Python 3.10+
✅ Node.js 16+
✅ Git
```

### Installation

**1. Clone Repository**
```bash
git clone https://github.com/Mayank-Ninawe/retinal-image-denoiser.git
cd retinal-image-denoiser
```

**2. Backend Setup**
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
python app.py
# ✅ Backend running on http://localhost:5000
```

**3. Frontend Setup**
```bash
cd frontend
npm install
npm start
# ✅ Frontend running on http://localhost:3000
```

**4. Open Application**  
Navigate to `http://localhost:3000` and upload a retinal image!

***

## 🎓 Filters & Algorithms

<table>
  <tr>
    <th>Filter</th>
    <th>How It Works</th>
    <th>PSNR (dB)</th>
    <th>Best For</th>
  </tr>
  <tr>
    <td><b>Median</b></td>
    <td>Replaces pixel with neighborhood median</td>
    <td align="center">28.45</td>
    <td>General noise removal</td>
  </tr>
  <tr>
    <td><b>⭐ Adaptive Median</b></td>
    <td>Dynamic window sizing based on noise density</td>
    <td align="center"><b>29.12</b></td>
    <td>Variable noise levels</td>
  </tr>
  <tr>
    <td><b>Bilateral</b></td>
    <td>Edge-aware smoothing (spatial + intensity)</td>
    <td align="center">27.89</td>
    <td>Vessel preservation</td>
  </tr>
  <tr>
    <td><b>Morphological</b></td>
    <td>Opening/closing operations</td>
    <td align="center">26.34</td>
    <td>Isolated specks</td>
  </tr>
  <tr>
    <td><b>Wiener</b></td>
    <td>Statistical filtering (local variance)</td>
    <td align="center">28.78</td>
    <td>Known noise model</td>
  </tr>
</table>

**🏆 Winner:** Adaptive Median (Best PSNR: 29.12 dB -  SSIM: 0.8456)

***

## 📡 API Documentation

**Base URL:** `https://retinal-image-denoiser-api.onrender.com`

<details>
<summary><b>1️⃣ Upload Image</b> - <code>POST /api/upload</code></summary>

```bash
curl -X POST -F "image=@retinal.jpg" \
  https://retinal-image-denoiser-api.onrender.com/api/upload
```

**Response:**
```json
{
  "success": true,
  "image_size": [565, 584],
  "image_b64": "data:image/jpeg;base64,..."
}
```

</details>

<details>
<summary><b>2️⃣ Denoise Image</b> - <code>POST /api/denoise</code></summary>

**Request:**
```json
{
  "image_b64": "base64_string",
  "filter_type": "adaptive",
  "kernel_size": 5
}
```

**Filters:** `median` | `adaptive` | `bilateral` | `morphological` | `wiener`

**Response:**
```json
{
  "success": true,
  "denoised_b64": "base64_result",
  "metrics": {
    "psnr": 29.12,
    "ssim": 0.8456
  }
}
```

</details>

<details>
<summary><b>3️⃣ Compare All Filters</b> - <code>POST /api/compare</code></summary>

**Response:**
```json
{
  "success": true,
  "results": {
    "median": { "image": "base64...", "psnr": 28.45 },
    "adaptive": { "image": "base64...", "psnr": 29.12 },
    "bilateral": { "image": "base64...", "psnr": 27.89 },
    "morphological": { "image": "base64...", "psnr": 26.34 },
    "wiener": { "image": "base64...", "psnr": 28.78 }
  }
}
```

</details>

---

## 📊 Performance

**System Benchmarks:**

| Metric | Value | Status |
|--------|-------|--------|
| ⚡ Processing Speed | <100ms per image | ✅ Fast |
| 🌐 API Response | <200ms avg | ✅ Efficient |
| 💾 Memory Usage | <500MB | ✅ Lightweight |
| 👥 Concurrent Users | 100+ | ✅ Scalable |

**Quality Metrics (DRIVE Dataset):**
```
📈 PSNR: 29.12 dB (Adaptive Median - best)
📊 SSIM: 0.8456 (84.5% structure preserved)
🎯 Noise Reduction: 90% removal rate
⏱️ Processing Time: 62ms average
```

***

## 📁 Project Structure

```
retinal-image-denoiser/
├── frontend/           # React.js application
│   ├── src/
│   │   ├── App.js     # Main component
│   │   └── index.css  # Tailwind styles
│   └── package.json
│
├── backend/           # Flask REST API
│   ├── app.py        # Main Flask app
│   ├── filters.py    # Denoising algorithms
│   └── requirements.txt
│
└── model/            # Data science notebooks
    ├── image_processing.ipynb
    └── datasets/DRIVE/
```

---

## 🤝 Contributing

Contributions welcome! 🎉

1. Fork the repository
2. Create feature branch: `git checkout -b feature/NewFilter`
3. Commit changes: `git commit -m 'Add: New filter algorithm'`
4. Push: `git push origin feature/NewFilter`
5. Open Pull Request

---

## 📞 Connect

**Mayank Ninawe**

- 🌐 GitHub: [@Mayank-Ninawe](https://github.com/Mayank-Ninawe)
- 💼 LinkedIn: [www.linkedin.com/in/mayank-ninawe-b95151354](https://www.linkedin.com/in/mayank-ninawe-b95151354)
- 📧 Email: mayakninawe22@gmail.com

💬 Open to feedback, collaborations, and opportunities!

---

## 🙏 Acknowledgments

- **[DRIVE Dataset](https://drive.grand-challenge.org/)** - Retinal image database
- **[OpenCV](https://opencv.org/)** - Computer vision library
- **[React](https://reactjs.org/)** - Frontend framework
- **[Flask](https://flask.palletsprojects.com/)** - Backend framework

---

<div align="center"

**Made with ❤️ and OpenCV**

*Transforming noisy medical images into diagnostic clarity*

⭐ **If this helped you, please star the repo!** ⭐

[⬆️ Back to Top](#-retinal-image-denoiser)

</div>
