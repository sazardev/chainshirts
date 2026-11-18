#!/usr/bin/env python3
"""Download real stock photos, apply a cinematic Chainsaw Man grade, and emit
super-compressed WebP assets for the offline bundle.

Source: Pexels (free to use under the Pexels License). The exact source URL for
every downloaded photo is recorded in CREDITS.md.
"""

from pathlib import Path
from urllib.parse import quote
from urllib.request import Request, urlopen
import io
import re
import time

import numpy as np
from PIL import Image

ROOT = Path('.')
PRODUCTS_DIR = ROOT / 'src/assets/products'
CATEGORIES_DIR = ROOT / 'src/assets/categories'
ASSETS_DIR = ROOT / 'src/assets'
for directory in (PRODUCTS_DIR, CATEGORIES_DIR):
    directory.mkdir(parents=True, exist_ok=True)

HEADERS = {'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/130 Safari/537.36'}

ACCENTS = {
    'magenta': np.array([255, 43, 214], dtype=np.float32),
    'cyan': np.array([0, 240, 255], dtype=np.float32),
    'violet': np.array([157, 78, 221], dtype=np.float32),
    'red': np.array([200, 20, 55], dtype=np.float32),
}

PRODUCTS = [
    ('chainsaw-pulse-tee', 'black graphic t shirt streetwear', 'magenta', 'red'),
    ('devil-mask-tee', 'streetwear t shirt fashion', 'cyan', 'violet'),
    ('blood-type-tee', 'white t shirt fashion men', 'red', 'magenta'),
    ('public-safety-hoodie', 'black hoodie streetwear', 'cyan', 'violet'),
    ('ignition-zip-hoodie', 'hoodie fashion dark', 'magenta', 'red'),
    ('gunslinger-hoodie', 'oversized hoodie streetwear', 'violet', 'cyan'),
    ('tactical-cargo-pants', 'cargo pants streetwear', 'violet', 'cyan'),
    ('street-patrol-pants', 'street style pants fashion', 'cyan', 'magenta'),
    ('chainsaw-track-pants', 'track pants fashion', 'magenta', 'violet'),
    ('fang-pro-wireless', 'gaming mouse', 'magenta', 'cyan'),
    ('akira-ambidextrous', 'computer mouse gaming', 'cyan', 'violet'),
    ('devil-trace-mouse', 'wireless mouse tech', 'violet', 'magenta'),
    ('type-65-mechanical', 'mechanical keyboard', 'cyan', 'magenta'),
    ('siren-tkl', 'gaming keyboard setup', 'magenta', 'cyan'),
    ('bloodline-60', 'keyboard minimal desk', 'violet', 'red'),
    ('chain-link-choker', 'chain necklace jewelry', 'magenta', 'violet'),
    ('fang-logo-cap', 'streetwear cap', 'cyan', 'magenta'),
    ('halo-knit-beanie', 'beanie fashion', 'violet', 'cyan'),
]

CATEGORIES = [
    ('t-shirts', 'graphic t shirt', 'magenta'),
    ('hoodies', 'black hoodie fashion', 'cyan'),
    ('pants', 'cargo pants', 'violet'),
    ('mice', 'gaming mouse', 'magenta'),
    ('keyboards', 'mechanical keyboard', 'cyan'),
    ('accessories', 'streetwear accessories', 'violet'),
]

CREDITS: list[tuple[str, str]] = []


def fetch(url: str, attempts: int = 3) -> bytes:
    last = None
    for attempt in range(attempts):
        try:
            with urlopen(Request(url, headers=HEADERS), timeout=30) as response:
                return response.read()
        except Exception as error:  # network hiccup; retry with a short pause
            last = error
            time.sleep(0.6 * (attempt + 1))
    raise RuntimeError(f'failed to fetch {url}: {last}')


def candidates(query: str) -> list[str]:
    url = f'https://www.pexels.com/search/{quote(query)}/'
    html = fetch(url).decode('utf-8', 'ignore')
    ids = list(dict.fromkeys(re.findall(r'images\.pexels\.com/photos/(\d+)/pexels-photo-\1\.jpeg', html)))
    return [f'https://images.pexels.com/photos/{photo_id}/pexels-photo-{photo_id}.jpeg' for photo_id in ids]


def grade(image: Image.Image, size: tuple[int, int], accent_a: str, accent_b: str) -> Image.Image:
    # Centre-crop to the target aspect, then apply a cinematic dark/neon grade.
    source_ratio = image.width / image.height
    target_ratio = size[0] / size[1]
    if source_ratio > target_ratio:
        new_width = int(image.height * target_ratio)
        left = (image.width - new_width) // 2
        image = image.crop((left, 0, left + new_width, image.height))
    else:
        new_height = int(image.width / target_ratio)
        top = (image.height - new_height) // 2
        image = image.crop((0, top, image.width, top + new_height))
    image = image.resize(size, Image.Resampling.LANCZOS)

    pixels = np.asarray(image.convert('RGB'), dtype=np.float32)
    luminance = pixels @ np.array([0.299, 0.587, 0.114], dtype=np.float32)
    pixels = pixels * 0.82 + luminance[..., None] * 0.18
    pixels = (pixels - 128) * 1.12 + 128

    height, width, _ = pixels.shape
    yy = np.linspace(0, 1, height, dtype=np.float32)[:, None, None]
    xx = np.linspace(0, 1, width, dtype=np.float32)[None, :, None]
    shade = 0.14 + 0.26 * yy
    pixels = pixels * (1 - shade) + np.array([11, 6, 18], dtype=np.float32) * shade

    glow_a = np.exp(-(((xx - 0.14) ** 2) / 0.09 + ((yy - 0.12) ** 2) / 0.11)) * 0.22
    glow_b = np.exp(-(((xx - 0.86) ** 2) / 0.11 + ((yy - 0.84) ** 2) / 0.13)) * 0.18
    pixels += ACCENTS[accent_a] * glow_a + ACCENTS[accent_b] * glow_b
    return Image.fromarray(np.clip(pixels, 0, 255).astype(np.uint8), 'RGB')


def save(image: Image.Image, destination: Path, size: tuple[int, int], accent_a: str, accent_b: str) -> None:
    graded = grade(image, size, accent_a, accent_b)
    graded.save(destination, 'WEBP', quality=68, method=6)
    print(f'  {destination.name}: {destination.stat().st_size // 1024} KB')


def download_product(name: str, query: str, accent_a: str, accent_b: str, index: int) -> None:
    urls = candidates(query)
    if not urls:
        raise RuntimeError(f'no candidates for {query}')
    chosen = urls[index % len(urls)]
    image_url = f'{chosen}?auto=compress&cs=tinysrgb&w=1000&h=1250&fit=crop'
    image = Image.open(io.BytesIO(fetch(image_url))).convert('RGB')
    save(image, PRODUCTS_DIR / f'{name}.webp', (800, 1000), accent_a, accent_b)
    CREDITS.append((name, image_url.split('?')[0]))


def main() -> None:
    print('Downloading product photos from Pexels...')
    for index, (name, query, accent_a, accent_b) in enumerate(PRODUCTS):
        try:
            download_product(name, query, accent_a, accent_b, index)
        except Exception as error:
            print(f'  ! {name}: {error}')

    print('Downloading category photos...')
    for name, query, accent in CATEGORIES:
        try:
            urls = candidates(query)
            image_url = f'{urls[0]}?auto=compress&cs=tinysrgb&w=800&h=1000&fit=crop'
            image = Image.open(io.BytesIO(fetch(image_url))).convert('RGB')
            save(image, CATEGORIES_DIR / f'{name}.webp', (640, 800), accent, accent)
            CREDITS.append((f'category:{name}', image_url.split('?')[0]))
        except Exception as error:
            print(f'  ! category {name}: {error}')

    print('Downloading hero photo...')
    try:
        urls = candidates('streetwear fashion neon city')
        image_url = f'{urls[0]}?auto=compress&cs=tinysrgb&w=1800&h=1000&fit=crop'
        image = Image.open(io.BytesIO(fetch(image_url))).convert('RGB')
        save(image, ASSETS_DIR / 'hero.webp', (1600, 900), 'magenta', 'cyan')
        CREDITS.append(('hero', image_url.split('?')[0]))
    except Exception as error:
        print(f'  ! hero: {error}')

    credits = '\n'.join(f'- `{name}`: {url}' for name, url in CREDITS)
    (ROOT / 'CREDITS.md').write_text(
        '# Image credits\n\n'
        'Product and lifestyle photography is sourced from Pexels under the '
        '[Pexels License](https://www.pexels.com/license/), downloaded at setup time, '
        'colour-graded and re-encoded as compressed WebP for this offline bundle.\n\n'
        f'{credits}\n'
    )
    print(f'Wrote CREDITS.md with {len(CREDITS)} sources')


if __name__ == '__main__':
    main()
