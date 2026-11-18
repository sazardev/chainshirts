#!/usr/bin/env python3
"""Build a short, silent brand film from local product photography.

Runs at setup time with ffmpeg + Pillow. The result is a small, self-hosted
MP4/WebM pair used on the landing page (autoplay background + lightbox).
"""

from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import subprocess

ROOT = Path('.')
OUT = ROOT / 'public/video'
OUT.mkdir(parents=True, exist_ok=True)
TMP = Path('/tmp/chainshirts-video')
TMP.mkdir(exist_ok=True)

SLIDES = [
    ('chainsaw-pulse-tee.webp', 'WEAR THE CHAOS', 'Public Safety Division · Season 03'),
    ('public-safety-hoodie.webp', 'BUILT FOR THE HUNT', 'Heavyweight layers. Sharp silhouettes.'),
    ('type-65-mechanical.webp', 'OWN YOUR DESK', 'Keyboards, mice and gear with an edge.'),
    ('hero.webp', 'NEW DROPS EVERY FRIDAY', 'ChainShirts'),
]

WIDTH, HEIGHT = 1280, 720


def font(size):
    return ImageFont.load_default(size=size)


def make_slide(image_path, title, subtitle, index):
    image = Image.open(image_path).convert('RGB')
    ratio = image.width / image.height
    target = WIDTH / HEIGHT
    if ratio > target:
        new_width = int(image.height * target)
        left = (image.width - new_width) // 2
        image = image.crop((left, 0, left + new_width, image.height))
    else:
        new_height = int(image.width / target)
        top = (image.height - new_height) // 2
        image = image.crop((0, top, image.width, top + new_height))
    image = image.resize((WIDTH, HEIGHT), Image.Resampling.LANCZOS)

    overlay = Image.new('RGBA', (WIDTH, HEIGHT), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    for y in range(HEIGHT):
        draw.line((0, y, WIDTH, y), fill=(11, 6, 18, int(20 + 60 * (y / HEIGHT))))
    image = Image.alpha_composite(image.convert('RGBA'), overlay).convert('RGB')

    draw = ImageDraw.Draw(image)
    draw.text((80, 70), 'CHAINSHIRTS', font=font(26), fill=(255, 255, 255))
    draw.rectangle((80, 110, 200, 116), fill=(255, 43, 214))
    draw.text((80, 430), title, font=font(74), fill=(255, 255, 255))
    draw.text((84, 530), subtitle, font=font(28), fill=(210, 198, 228))
    draw.text((80, 650), f'0{index + 1} / 04', font=font(20), fill=(255, 43, 214))
    path = TMP / f'slide-{index}.png'
    image.save(path)
    return path


def main():
    slides = []
    for index, (name, title, subtitle) in enumerate(SLIDES):
        base = ROOT / 'src/assets/products'
        source = base / name if (base / name).exists() else ROOT / 'src/assets' / name
        slides.append(make_slide(source, title, subtitle, index))

    inputs = ' '.join(f'-loop 1 -t 3 -i {path}' for path in slides)
    filters = []
    for index in range(4):
        filters.append(
            f"[{index}:v]scale=1400:788,"
            f"zoompan=z='min(zoom+0.0009,1.12)':d=72:s={WIDTH}x{HEIGHT}:fps=24,"
            f"setsar=1,format=yuv420p[v{index}]"
        )
    filters.append('[v0][v1]xfade=transition=fade:duration=0.45:offset=2.55[x1]')
    filters.append('[x1][v2]xfade=transition=fade:duration=0.45:offset=5.05[x2]')
    filters.append('[x2][v3]xfade=transition=fade:duration=0.45:offset=7.55[out]')
    filter_complex = ';'.join(filters)

    subprocess.run(
        f"ffmpeg -y -hide_banner -loglevel error {inputs} -filter_complex \"{filter_complex}\" "
        f"-map [out] -t 10.5 -an -c:v libx264 -preset slow -crf 31 -pix_fmt yuv420p "
        f"-movflags +faststart {OUT / 'intro.mp4'}",
        shell=True,
        check=True,
    )
    subprocess.run(
        f"ffmpeg -y -hide_banner -loglevel error {inputs} -filter_complex \"{filter_complex}\" "
        f"-map [out] -t 10.5 -an -c:v libvpx-vp9 -crf 38 -b:v 0 -row-mt 1 {OUT / 'intro.webm'}",
        shell=True,
        check=True,
    )
    for path in (OUT / 'intro.mp4', OUT / 'intro.webm'):
        print(f'{path.name}: {path.stat().st_size // 1024} KB')


if __name__ == '__main__':
    main()
