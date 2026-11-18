#!/usr/bin/env python3
"""Add a second, larger wave of real stock photos, graded and compressed, plus
wide promotional banners. Sources are appended to CREDITS.md.
"""

from pathlib import Path
from urllib.parse import quote
from urllib.request import Request, urlopen
import importlib.util
import io
import re
import subprocess

from PIL import Image, ImageDraw

spec = importlib.util.spec_from_file_location('fs', 'scripts/fetch-stock.py')
fs = importlib.util.module_from_spec(spec)
spec.loader.exec_module(fs)

UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/130 Safari/537.36'
HEADERS = {'User-Agent': UA}
OUT = Path('src/assets/products')
BANNERS = Path('src/assets/banners')
BANNERS.mkdir(parents=True, exist_ok=True)

NEW = [
    ('midnight-flame-tee', 'black graphic t shirt', 'magenta', 'red'),
    ('hunter-oversized-tee', 'oversized t shirt streetwear', 'cyan', 'violet'),
    ('tokyo-graphics-tee', 'printed t shirt fashion', 'violet', 'magenta'),
    ('chain-skeleton-tee', 'skull t shirt fashion', 'red', 'magenta'),
    ('red-signal-tee', 'red t shirt fashion', 'red', 'violet'),
    ('shadow-pullover', 'pullover hoodie', 'violet', 'cyan'),
    ('devil-hunter-zip', 'zip hoodie streetwear', 'magenta', 'cyan'),
    ('concrete-fleece', 'grey hoodie fashion', 'cyan', 'violet'),
    ('neo-tokyo-hoodie', 'hoodie neon fashion', 'magenta', 'violet'),
    ('blackout-crew', 'crewneck sweatshirt', 'obsidian' if False else 'violet', 'cyan'),
    ('cargo-utility-pants', 'cargo pants men', 'violet', 'cyan'),
    ('black-street-jeans', 'black jeans streetwear', 'cyan', 'magenta'),
    ('techwear-pants', 'techwear pants', 'violet', 'magenta'),
    ('wide-leg-denim', 'wide leg jeans', 'cyan', 'violet'),
    ('training-joggers', 'joggers pants', 'magenta', 'cyan'),
    ('limited-shorts', 'shorts streetwear', 'violet', 'cyan'),
    ('pulse-gaming-mouse', 'gaming mouse', 'magenta', 'cyan'),
    ('pro-wireless-mouse', 'wireless mouse black', 'cyan', 'violet'),
    ('rgb-ergonomic-mouse', 'rgb mouse', 'violet', 'magenta'),
    ('desk-mouse-pad', 'mouse pad gaming', 'cyan', 'magenta'),
    ('mech-keyboard-75', 'mechanical keyboard rgb', 'cyan', 'magenta'),
    ('compact-keyboard', 'compact keyboard', 'violet', 'cyan'),
    ('gaming-headset', 'gaming headset', 'magenta', 'cyan'),
    ('studio-headphones', 'headphones black', 'cyan', 'violet'),
    ('desk-mat-xl', 'desk mat gaming', 'violet', 'magenta'),
    ('gaming-controller', 'game controller', 'magenta', 'cyan'),
    ('cap-black-logo', 'black cap streetwear', 'cyan', 'magenta'),
    ('crossbody-bag', 'crossbody bag streetwear', 'violet', 'cyan'),
    ('chain-bracelet', 'bracelet jewelry', 'magenta', 'violet'),
    ('socks-pack', 'socks fashion', 'cyan', 'magenta'),
]

BANNER_QUERIES = [
    ('banner-drop', 'streetwear fashion dark', 'WEAR THE CHAOS', 'New season · Public Safety Division'),
    ('banner-gear', 'gaming setup neon', 'DESK DOMINION', 'Keyboards, mice and gear built for the hunt'),
    ('banner-sale', 'fashion sale clothing', 'THE BIG DROP', 'Up to 40% off selected styles'),
]


def search(query):
    html = subprocess.run(
        ['curl', '-fsSL', '--max-time', '30', f'https://www.pexels.com/search/{quote(query)}/', '-H', f'User-Agent: {UA}'],
        capture_output=True,
    ).stdout.decode('utf8', 'ignore')
    return list(dict.fromkeys(re.findall(r'images\.pexels\.com/photos/(\d+)/pexels-photo-\1\.jpeg', html)))


def download(photo_id, width, height):
    url = f'https://images.pexels.com/photos/{photo_id}/pexels-photo-{photo_id}.jpeg'
    data = urlopen(Request(f'{url}?auto=compress&cs=tinysrgb&w={width}&h={height}&fit=crop', headers=HEADERS), timeout=30).read()
    return Image.open(io.BytesIO(data)).convert('RGB'), url


def banner_image(image, title, subtitle):
    size = (1600, 500)
    graded = fs.grade(image, size, 'magenta', 'cyan')
    overlay = Image.new('RGBA', size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    for y in range(size[1]):
        alpha = int(90 + 110 * (y / size[1]))
        draw.line((0, y, size[0], y), fill=(11, 6, 18, alpha))
    # The carousel renders the headline over the image at runtime, so the
    # stored banner stays text-free and reusable in any language.
    return Image.alpha_composite(graded.convert('RGBA'), overlay).convert('RGB')


def ImageFontBold(size):
    from PIL import ImageFont
    return ImageFont.load_default(size=size)


def main():
    credits = Path('CREDITS.md').read_text().splitlines()
    print('Downloading additional product photos...')
    for index, (name, query, accent_a, accent_b) in enumerate(NEW):
        try:
            ids = search(query)
            if not ids:
                raise RuntimeError('no results')
            photo_id = ids[index % len(ids)]
            image, url = download(photo_id, 1000, 1250)
            dest = OUT / f'{name}.webp'
            fs.save(image, dest, (800, 1000), accent_a, accent_b)
            credits.append(f'- `{name}`: {url}')
        except Exception as error:
            print(f'  ! {name}: {error}')

    print('Downloading promotional banners...')
    for name, query, title, subtitle in BANNER_QUERIES:
        try:
            ids = search(query)
            image, url = download(ids[0], 1800, 700)
            graded = banner_image(image, title, subtitle)
            dest = BANNERS / f'{name}.webp'
            graded.save(dest, 'WEBP', quality=68, method=6)
            print(f'  {dest.name}: {dest.stat().st_size // 1024} KB')
            credits.append(f'- `banner:{name}`: {url}')
        except Exception as error:
            print(f'  ! banner {name}: {error}')

    Path('CREDITS.md').write_text('\n'.join(credits) + '\n')
    print('Done')


if __name__ == '__main__':
    main()
