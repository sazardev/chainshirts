#!/usr/bin/env python3
"""Add alternate product photos to each entry so detail pages have a gallery."""

from pathlib import Path
from urllib.parse import quote
from urllib.request import Request, urlopen
import importlib.util
import io
import re
import subprocess

from PIL import Image

spec = importlib.util.spec_from_file_location('fs', 'scripts/fetch-stock.py')
fs = importlib.util.module_from_spec(spec)
spec.loader.exec_module(fs)

UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/130 Safari/537.36'
HEADERS = {'User-Agent': UA}
OUT = Path('src/assets/products/gallery')
OUT.mkdir(parents=True, exist_ok=True)


def search(query):
    html = subprocess.run(
        ['curl', '-fsSL', '--max-time', '30', f'https://www.pexels.com/search/{quote(query)}/', '-H', f'User-Agent: {UA}'],
        capture_output=True,
    ).stdout.decode('utf8', 'ignore')
    return list(dict.fromkeys(re.findall(r'images\.pexels\.com/photos/(\d+)/pexels-photo-\1\.jpeg', html)))


def main():
    credits = Path('CREDITS.md').read_text().splitlines()
    entries = []
    for entry in sorted(Path('src/content/products').glob('*.md')):
        text = entry.read_text()
        slug = entry.stem
        category = re.search(r'^category: (\S+)$', text, re.M).group(1)
        query = f'{category} product streetwear'.replace('mice', 'gaming mouse').replace('keyboards', 'mechanical keyboard')
        accent = {'t-shirts': 'magenta', 'hoodies': 'cyan', 'pants': 'violet', 'mice': 'magenta', 'keyboards': 'cyan', 'accessories': 'violet'}.get(category, 'violet')
        try:
            ids = search(query)
            if len(ids) < 2:
                continue
            photo_id = ids[1]
            url = f'https://images.pexels.com/photos/{photo_id}/pexels-photo-{photo_id}.jpeg'
            data = urlopen(Request(f'{url}?auto=compress&cs=tinysrgb&w=1000&h=1250&fit=crop', headers=HEADERS), timeout=30).read()
            image = Image.open(io.BytesIO(data)).convert('RGB')
            dest = OUT / f'{slug}-2.webp'
            fs.save(image, dest, (800, 1000), accent, accent)
            credits.append(f'- `gallery:{slug}`: {url}')
            entries.append((entry, f'../../assets/products/gallery/{slug}-2.webp', slug))
        except Exception as error:
            print(f'  ! {slug}: {error}')

    for entry, path, slug in entries:
        text = entry.read_text()
        if 'gallery: [' in text and ']' in text:
            text = re.sub(r'^gallery: \[.*\]$', f'gallery: [{path}]', text, flags=re.M)
            text = re.sub(r'^galleryAlt: \[.*\]$', f'galleryAlt: [Alternate angle for {slug}]', text, flags=re.M)
            entry.write_text(text)

    Path('CREDITS.md').write_text('\n'.join(credits) + '\n')
    print(f'Added {len(entries)} gallery images')


if __name__ == '__main__':
    main()
