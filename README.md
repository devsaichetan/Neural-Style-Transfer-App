# Neural-Style-Transfer-App

# 🎨 Neural Style Transfer Web Application

### Transform Ordinary Photos into Stunning Artwork using Deep Learning and Adaptive Instance Normalization (AdaIN)

**Built with PyTorch • FastAPI • Docker • Hugging Face Spaces**

[Live Demo](https://chetanrocks-neural-style-transfer-app.hf.space) • [Report Bug](../../issues) • [Request Feature](../../issues)

---

## 📖 Overview

Neural Style Transfer (NST) is a Deep Learning technique that blends the **content of one image** with the **artistic style of another image** to generate a completely new image.

This project implements **Adaptive Instance Normalization (AdaIN)** for real-time style transfer. Users can upload:

🖼️ A **Content Image** – The photograph whose structure is preserved.

🎨 A **Style Image** – The artwork whose visual characteristics are transferred.

🤖 The application generates a stylized image that combines both, producing visually appealing artistic outputs.

---

## ✨ Features

* 🎨 Real-time Neural Style Transfer
* 🖼️ Upload Content and Style Images
* ⚡ Fast Inference using PyTorch
* 🌐 Interactive Web Interface
* 📥 Download Generated Artwork
* 🧠 Adaptive Instance Normalization (AdaIN)
* 🐳 Dockerized Deployment
* ☁️ Hosted on Hugging Face Spaces
* 📱 Responsive and Modern UI
* 🚀 End-to-End AI Application

---

## 🏗️ System Architecture

```text
Content Image ──┐
                │
                ▼
          VGG Encoder
                │
                ▼
Style Image ───► AdaIN Module
                │
                ▼
             Decoder
                │
                ▼
        Stylized Output Image
```

---

## 🧠 Deep Learning Pipeline

### Step 1: Content Image

The content image is passed through the VGG Encoder to extract structural features.

### Step 2: Style Image

The style image is passed through the same encoder to extract style representations.

### Step 3: Adaptive Instance Normalization (AdaIN)

AdaIN aligns the mean and variance of content features with style features.

### Step 4: Decoder

The decoder reconstructs an image that preserves the content structure while adopting the artistic style.

---

## 🛠️ Tech Stack

### Deep Learning

* PyTorch
* TorchVision
* Adaptive Instance Normalization (AdaIN)
* VGG Encoder
* Custom Decoder Network

### Backend

* FastAPI
* Jinja2
* Python

### Frontend

* HTML5
* CSS3
* JavaScript
* Font Awesome

### Deployment

* Docker
* Hugging Face Spaces
* Git
* GitHub

---

## 📂 Project Structure

```text
Neural-Style-Transfer-App
│
├── app.py
├── Dockerfile
├── requirements.txt
├── Procfile
├── decoder_final.pth
├── vgg_normalised.pth
│
├── templates/
│   └── index.html
│
├── static/
│   ├── style.css
│   └── script.js
│
├── uploads/
│   ├── content/
│   └── style/
│
├── outputs/
│
└── utils/
    ├── models.py
    └── utils.py
```

---

## 🚀 Live Demo

### Try the Application

🔗 **Live Demo:** https://chetanrocks-neural-style-transfer-app.hf.space

---

## ⚙️ Installation

### Clone Repository

```bash
git clone https://github.com/devsaichetan/Neural-Style-Transfer-App.git
cd Neural-Style-Transfer-App
```

---

### Create Virtual Environment

#### Windows

```bash
python -m venv venv
venv\Scripts\activate
```

#### Linux/Mac

```bash
python3 -m venv venv
source venv/bin/activate
```

---

### Install Dependencies

```bash
pip install -r requirements.txt
```

---

### Run Locally

```bash
uvicorn app:app --reload
```

Open:

```text
http://127.0.0.1:8000
```

---

## 🖼️ How to Use

### Step 1

Upload a Content Image.

### Step 2

Upload a Style Image.

### Step 3

Click:

```text
Generate Artwork
```

### Step 4

Wait for the model to perform style transfer.

### Step 5

Download the generated artistic image.

---

## 🎯 Key Highlights

* End-to-End AI Product Development
* Custom Neural Style Transfer Implementation
* Deep Learning Model Deployment
* FastAPI Production Integration
* Docker Containerization
* Cloud Hosting on Hugging Face Spaces
* Interactive User Experience

---

## 🔮 Future Improvements

* Multiple Artistic Style Blending
* Adjustable Style Strength
* High Resolution Image Generation
* Video Style Transfer
* Batch Processing
* GPU Acceleration
* Style Gallery and Presets
* User Authentication

---

## 👨‍💻 Author

**Chetan Sai**

Computer Science Engineer | AI & Machine Learning Enthusiast | Full Stack Developer

GitHub: https://github.com/devsaichetan

LinkedIn: https://www.linkedin.com/in/your-linkedin-profile/

---

## ⭐ Support

If you found this project useful:

⭐ Star the repository

🍴 Fork the repository

🧠 Share feedback and suggestions

---

### 🎨 "Where Photography Meets Art Through Deep Learning" 🎨

Built with ❤️ using PyTorch and FastAPI
