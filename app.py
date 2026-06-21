from fastapi import FastAPI, Request, UploadFile, File
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pathlib import Path

import os
import uuid
import torch
from pathlib import Path
from PIL import Image
from torchvision import transforms
from torchvision.utils import save_image

from utils.models import *
from utils.utils import adaptive_instance_normalization

app = FastAPI()

# =====================================================
# Base Directory
# =====================================================
BASE_DIR = Path(__file__).resolve().parent

# =====================================================
# Create Folders
# =====================================================
os.makedirs(BASE_DIR / "uploads" / "content", exist_ok=True)
os.makedirs(BASE_DIR / "uploads" / "style", exist_ok=True)
os.makedirs(BASE_DIR / "outputs", exist_ok=True)

# =====================================================
# Static and Templates
# =====================================================
app.mount("/static", StaticFiles(directory="static"), name="static")
app.mount("/outputs", StaticFiles(directory="outputs"), name="outputs")

templates = Jinja2Templates(directory="templates")

# =====================================================
# Device (Render Free has no GPU)
# =====================================================
device = torch.device("cpu")
print("Using Device:", device)

# Disable gradient calculations globally
torch.set_grad_enabled(False)

# =====================================================
# Load Models Once
# =====================================================
encoder = VGGEncoder(
    str(BASE_DIR / "vgg_normalised.pth")
).to(device)

decoder = Decoder().to(device)

decoder.load_state_dict(
    torch.load(
        BASE_DIR / "decoder_final.pth",
        map_location="cpu"
    )
)

encoder.eval()
decoder.eval()

# =====================================================
# Image Transform
# =====================================================
transform = transforms.Compose([
    transforms.Resize((256, 256)),
    transforms.ToTensor()
])

# =====================================================
# Home Page
# =====================================================
@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse(
        request=request,
        name="index.html",
        context={
            "result_image": None
        }
    )

# =====================================================
# Generate Stylized Image
# =====================================================
@app.post("/", response_class=HTMLResponse)
async def stylize(
    request: Request,
    content: UploadFile = File(...),
    style: UploadFile = File(...)
):

    # Save uploaded files
    content_path = (
        BASE_DIR
        / "uploads"
        / "content"
        / f"{uuid.uuid4()}_{content.filename}"
    )

    style_path = (
        BASE_DIR
        / "uploads"
        / "style"
        / f"{uuid.uuid4()}_{style.filename}"
    )

    with open(content_path, "wb") as f:
        f.write(await content.read())

    with open(style_path, "wb") as f:
        f.write(await style.read())

    # Open images
    content_img = Image.open(content_path).convert("RGB")
    style_img = Image.open(style_path).convert("RGB")

    # Transform
    content_tensor = (
        transform(content_img)
        .unsqueeze(0)
        .to(device)
    )

    style_tensor = (
        transform(style_img)
        .unsqueeze(0)
        .to(device)
    )

    # Stylize
    with torch.no_grad():

        try:
            c_feat = encoder(
                content_tensor,
                is_test=True
            )

            s_feat = encoder(
                style_tensor,
                is_test=True
            )

        except Exception:
            c_feat = encoder(content_tensor)[-1]
            s_feat = encoder(style_tensor)[-1]

        t = adaptive_instance_normalization(
            c_feat,
            s_feat
        )

        output = decoder(t)

    # Save output image
    output_name = f"{uuid.uuid4()}.png"

    output_path = (
        BASE_DIR
        / "outputs"
        / output_name
    )

    save_image(output, output_path)

    return templates.TemplateResponse(
        request=request,
        name="index.html",
        context={
            "result_image": f"/outputs/{output_name}"
        }
    )