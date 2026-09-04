import os
import math
from PIL import Image, ImageDraw, ImageFont

OUT_FRAMES_DIR = r"c:\Users\Darne\OneDrive\Pictures\Avatar\public\frames"
SIZE = 1080
CENTER = SIZE // 2
RADIUS_OUTER = 475
RADIUS_INNER = 370

def create_gold_laurel_frame():
    # Frame 7: Kỷ niệm THPT Vĩnh Thuận - Hoàng Gia / Vinh Danh (Navy & Gold)
    img = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # 1. Outer decorative ring (Navy & Gold double rings)
    # Outer navy ring
    for r in range(480, 465, -1):
        alpha = int(255 * (r - 465) / 15)
        draw.ellipse((CENTER - r, CENTER - r, CENTER + r, CENTER + r), outline=(15, 23, 42, 255), width=2)
    
    # Gold border ring
    for i in range(12):
        r = 465 - i
        # Gold gradient: #f59e0b to #fbbf24 to #d97706
        t = (math.sin(i * 0.5) + 1) / 2
        gold_r = int(217 + (251 - 217) * t)
        gold_g = int(119 + (191 - 119) * t)
        gold_b = int(6 + (36 - 6) * t)
        draw.ellipse((CENTER - r, CENTER - r, CENTER + r, CENTER + r), outline=(gold_r, gold_g, gold_b, 255), width=2)

    # Inner Navy ring
    for r in range(453, 435, -1):
        draw.ellipse((CENTER - r, CENTER - r, CENTER + r, CENTER + r), outline=(30, 58, 138, 255), width=2)

    # Gold inner edge ring
    for r in range(375, 370, -1):
        draw.ellipse((CENTER - r, CENTER - r, CENTER + r, CENTER + r), outline=(245, 158, 11, 255), width=2)

    # 2. Draw Golden Laurel Leaves along the lower sides
    def draw_laurel_leaf(cx, cy, angle_deg, length, color):
        rad = math.radians(angle_deg)
        cos_a = math.cos(rad)
        sin_a = math.sin(rad)
        # Leaf points
        p_tip = (cx + length * cos_a, cy + length * sin_a)
        p_left = (cx + length * 0.4 * cos_a - length * 0.3 * sin_a, cy + length * 0.4 * sin_a + length * 0.3 * cos_a)
        p_right = (cx + length * 0.4 * cos_a + length * 0.3 * sin_a, cy + length * 0.4 * sin_a - length * 0.3 * cos_a)
        draw.polygon([(cx, cy), p_left, p_tip, p_right], fill=color)

    # Left and right laurel branches
    for deg in range(110, 240, 10):
        rad = math.radians(deg)
        bx = CENTER + 410 * math.cos(rad)
        by = CENTER + 410 * math.sin(rad)
        draw_laurel_leaf(bx, by, deg + 45, 32, (251, 191, 36, 255))
        draw_laurel_leaf(bx, by, deg - 45, 28, (245, 158, 11, 240))
        
    for deg in range(300, 430, 10):
        rad = math.radians(deg)
        bx = CENTER + 410 * math.cos(rad)
        by = CENTER + 410 * math.sin(rad)
        draw_laurel_leaf(bx, by, deg - 45, 32, (251, 191, 36, 255))
        draw_laurel_leaf(bx, by, deg + 45, 28, (245, 158, 11, 240))

    # 3. Top Ribbon / Header Badge: "THPT VĨNH THUẬN - 1979"
    # Arch background banner at the top
    top_banner_w = 640
    top_banner_h = 100
    top_box = (CENTER - top_banner_w // 2, 50, CENTER + top_banner_w // 2, 50 + top_banner_h)
    draw.rounded_rectangle(top_box, radius=24, fill=(15, 23, 42, 245), outline=(245, 158, 11, 255), width=4)
    
    # Gold decorative stars around top badge
    def draw_star(sx, sy, r, color):
        pts = []
        for i in range(10):
            a = i * math.pi / 5 - math.pi / 2
            d = r if i % 2 == 0 else r * 0.4
            pts.append((sx + d * math.cos(a), sy + d * math.sin(a)))
        draw.polygon(pts, fill=color)

    draw_star(CENTER - 260, 100, 18, (251, 191, 36, 255))
    draw_star(CENTER + 260, 100, 18, (251, 191, 36, 255))

    # Text for top banner
    try:
        font_title = ImageFont.truetype("arialbd.ttf", 36)
        font_sub = ImageFont.truetype("arial.ttf", 22)
    except:
        font_title = ImageFont.load_default()
        font_sub = ImageFont.load_default()

    draw.text((CENTER, 80), "TRƯỜNG THPT VĨNH THUẬN", fill=(254, 243, 199, 255), font=font_title, anchor="mm")
    draw.text((CENTER, 120), "★ KỶ NIỆM THÀNH LẬP 1979 ★", fill=(251, 191, 36, 255), font=font_sub, anchor="mm")

    # 4. Bottom Ribbon: "TỰ HÀO TRUYỀN THỐNG - VỮNG BƯỚC TƯƠNG LAI"
    bot_banner_w = 720
    bot_banner_h = 90
    bot_box = (CENTER - bot_banner_w // 2, SIZE - 145, CENTER + bot_banner_w // 2, SIZE - 55)
    draw.rounded_rectangle(bot_box, radius=20, fill=(30, 58, 138, 250), outline=(251, 191, 36, 255), width=4)
    draw.text((CENTER, SIZE - 100), "TỰ HÀO TRUYỀN THỐNG • VỮNG BƯỚC TƯƠNG LAI", fill=(255, 255, 255, 255), font=font_title, anchor="mm")

    # Cut out center hole explicitly
    hole_mask = Image.new("L", (SIZE, SIZE), 255)
    h_draw = ImageDraw.Draw(hole_mask)
    h_draw.ellipse((CENTER - RADIUS_INNER, CENTER - RADIUS_INNER, CENTER + RADIUS_INNER, CENTER + RADIUS_INNER), fill=0)
    
    # Outer circle mask
    h_draw.ellipse((CENTER - 490, CENTER - 490, CENTER + 490, CENTER + 490), fill=255)
    
    img.putalpha(hole_mask)
    
    out_file = os.path.join(OUT_FRAMES_DIR, "frame_7_vinh_thuan_royal_gold.png")
    img.save(out_file, "PNG")
    print(f"Saved: {out_file}")

def create_modern_academic_frame():
    # Frame 8: Chào Mừng & Khát Vọng Tuổi Trẻ (Modern Crimson & Royal Blue)
    img = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Dynamic angled ribbons around circle
    # Red vibrant ring
    for r in range(475, 455, -1):
        draw.ellipse((CENTER - r, CENTER - r, CENTER + r, CENTER + r), outline=(220, 38, 38, 255), width=2)
    # White separator
    for r in range(455, 448, -1):
        draw.ellipse((CENTER - r, CENTER - r, CENTER + r, CENTER + r), outline=(255, 255, 255, 255), width=2)
    # Ocean Blue ring
    for r in range(448, 420, -1):
        draw.ellipse((CENTER - r, CENTER - r, CENTER + r, CENTER + r), outline=(2, 132, 199, 255), width=2)
    # Inner gold border
    for r in range(375, 368, -1):
        draw.ellipse((CENTER - r, CENTER - r, CENTER + r, CENTER + r), outline=(250, 204, 21, 255), width=2)

    # Decorative dots
    for deg in range(0, 360, 15):
        rad = math.radians(deg)
        dx = CENTER + 434 * math.cos(rad)
        dy = CENTER + 434 * math.sin(rad)
        draw.ellipse((dx - 4, dy - 4, dx + 4, dy + 4), fill=(255, 255, 255, 255))

    # Top Ribbon: "THPT VĨNH THUẬN - CHÀO NĂM HỌC MỚI"
    try:
        font_large = ImageFont.truetype("arialbd.ttf", 38)
        font_medium = ImageFont.truetype("arialbd.ttf", 32)
        font_small = ImageFont.truetype("arial.ttf", 24)
    except:
        font_large = ImageFont.load_default()
        font_medium = ImageFont.load_default()
        font_small = ImageFont.load_default()

    top_w = 680
    top_h = 100
    t_box = (CENTER - top_w // 2, 45, CENTER + top_w // 2, 45 + top_h)
    draw.rounded_rectangle(t_box, radius=25, fill=(185, 28, 28, 245), outline=(250, 204, 21, 255), width=4)
    draw.text((CENTER, 78), "CHÀO NĂM HỌC MỚI 2026 - 2027", fill=(255, 255, 255, 255), font=font_medium, anchor="mm")
    draw.text((CENTER, 118), "TRƯỜNG THPT VĨNH THUẬN", fill=(254, 240, 138, 255), font=font_small, anchor="mm")

    # Bottom Banner: "TRI THỨC - ĐẠO ĐỨC - SÁNG TẠO"
    bot_w = 700
    bot_h = 95
    b_box = (CENTER - bot_w // 2, SIZE - 145, CENTER + bot_w // 2, SIZE - 50)
    draw.rounded_rectangle(b_box, radius=24, fill=(3, 105, 161, 245), outline=(250, 204, 21, 255), width=4)
    draw.text((CENTER, SIZE - 98), "TRI THỨC • BẢN LĨNH • SÁNG TẠO", fill=(255, 255, 255, 255), font=font_large, anchor="mm")

    # Cut out center hole
    hole_mask = Image.new("L", (SIZE, SIZE), 255)
    h_draw = ImageDraw.Draw(hole_mask)
    h_draw.ellipse((CENTER - RADIUS_INNER, CENTER - RADIUS_INNER, CENTER + RADIUS_INNER, CENTER + RADIUS_INNER), fill=0)
    img.putalpha(hole_mask)

    out_file = os.path.join(OUT_FRAMES_DIR, "frame_8_tu_hao_vinh_thuan.png")
    img.save(out_file, "PNG")
    print(f"Saved: {out_file}")

create_gold_laurel_frame()
create_modern_academic_frame()
print("All professional frames generated successfully!")
