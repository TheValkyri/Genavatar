import os
from PIL import Image, ImageDraw, ImageFilter
import numpy as np

SRC_FRAMES = r"C:\Users\Darne\Downloads\ChatGPT Image Sep 4, 2026, 12_08_08 PM.png"
SRC_LOGO = r"C:\Users\Darne\.gemini\antigravity\brain\2abb3a5e-edef-4bd5-b5df-120ba6c3bb3f\.user_uploaded\media_1788498239700.jpg"
OUT_FRAMES_DIR = r"c:\Users\Darne\OneDrive\Pictures\Avatar\public\frames"
OUT_LOGOS_DIR = r"c:\Users\Darne\OneDrive\Pictures\Avatar\public\logos"

os.makedirs(OUT_FRAMES_DIR, exist_ok=True)
os.makedirs(OUT_LOGOS_DIR, exist_ok=True)

img = Image.open(SRC_FRAMES).convert("RGBA")
W, H = img.size

# 6 regions (col, row)
regions = [
    (0, 0, 512, 512),       # Frame 1: Khai giảng hoa & cờ đỏ
    (512, 0, 1024, 512),    # Frame 2: Máy bay giấy & sách vở
    (1024, 0, 1536, 512),   # Frame 3: Chào năm học mới & nơ đỏ
    (0, 512, 512, 1024),    # Frame 4: Trường học & cờ & tháp chuông
    (512, 512, 1024, 1024), # Frame 5: Niên khóa 2025-2026 & hoa
    (1024, 512, 1536, 1024) # Frame 6: Nơ đỏ & Back to school
]

frame_names = [
    "frame_1_khai_giang.png",
    "frame_2_may_bay_giay.png",
    "frame_3_chao_nam_hoc_moi.png",
    "frame_4_mai_truong.png",
    "frame_5_nien_khoa_moi.png",
    "frame_6_back_to_school.png"
]

print("Processing 6 frames from ChatGPT sheet...")
for idx, (x0, y0, x1, y1) in enumerate(regions):
    cell = img.crop((x0, y0, x1, y1))
    arr = np.array(cell)
    alpha = arr[:, :, 3]

    # Find the non-transparent pixels that form the circular frame and decoration
    opaque_pts = np.argwhere(alpha > 30)
    if len(opaque_pts) == 0:
        continue
    
    # Bounding box of the frame in this cell
    min_y, min_x = opaque_pts.min(axis=0)
    max_y, max_x = opaque_pts.max(axis=0)
    
    # Center of the bounding box
    cx = (min_x + max_x) // 2
    cy = (min_y + max_y) // 2
    
    # Half-size to crop a nice square around the frame with a little breathing room
    span = max(max_x - min_x, max_y - min_y) // 2 + 16
    crop_x0 = max(0, cx - span)
    crop_y0 = max(0, cy - span)
    crop_x1 = min(512, cx + span)
    crop_y1 = min(512, cy + span)
    
    cropped = cell.crop((crop_x0, crop_y0, crop_x1, crop_y1))
    
    # Make a square canvas with padding if necessary
    max_side = max(cropped.size)
    sq = Image.new("RGBA", (max_side, max_side), (0, 0, 0, 0))
    paste_x = (max_side - cropped.width) // 2
    paste_y = (max_side - cropped.height) // 2
    sq.paste(cropped, (paste_x, paste_y))
    
    # Upscale to crisp 1080x1080
    final_1080 = sq.resize((1080, 1080), Image.Resampling.LANCZOS)
    
    out_path = os.path.join(OUT_FRAMES_DIR, frame_names[idx])
    final_1080.save(out_path, "PNG")
    print(f"Saved: {frame_names[idx]} (1080x1080)")

# Process School Logo
print("Processing School Logo...")
logo_img = Image.open(SRC_LOGO).convert("RGBA")
lw, lh = logo_img.size
mask = Image.new("L", (lw, lh), 0)
draw = ImageDraw.Draw(mask)
inset = 10
draw.ellipse((inset, inset, lw - inset, lh - inset), fill=255)
mask = mask.filter(ImageFilter.GaussianBlur(1.5))

logo_clean = Image.new("RGBA", (lw, lh), (0, 0, 0, 0))
logo_clean.paste(logo_img, (0, 0), mask=mask)

out_logo_path = os.path.join(OUT_LOGOS_DIR, "logo_thpt_vinh_thuan.png")
logo_clean.save(out_logo_path, "PNG")
print(f"Saved school logo to: {out_logo_path}")
