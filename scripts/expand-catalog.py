#!/usr/bin/env python3
"""Third catalog wave: 5 new categories, 76 products, 3 photos each, 3 new banners."""

from pathlib import Path
from urllib.parse import quote
from urllib.request import Request, urlopen
import importlib.util
import io
import random
import re
import subprocess

from PIL import Image, ImageDraw

spec = importlib.util.spec_from_file_location('fs', 'scripts/fetch-stock.py')
fs = importlib.util.module_from_spec(spec)
spec.loader.exec_module(fs)

UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/130 Safari/537.36'
HEADERS = {'User-Agent': UA}
random.seed(23)

CONTENT = Path('src/content/products')
PRODUCTS = Path('src/assets/products')
GALLERY = PRODUCTS / 'gallery'
BANNERS = Path('src/assets/banners')
GALLERY.mkdir(parents=True, exist_ok=True)

BRANDS = ['Public Safety Co.', 'Neon Division', 'Chainworks', 'Tokyo Gear', 'Hunter Supply', 'Fang Labs']
PALETTES = {
    't-shirts': ['obsidian', 'bone', 'blood-red'],
    'hoodies': ['obsidian', 'neon-violet', 'steel'],
    'pants': ['obsidian', 'steel', 'bone'],
    'mice': ['obsidian', 'neon-cyan', 'neon-violet'],
    'keyboards': ['obsidian', 'neon-cyan', 'neon-violet'],
    'accessories': ['obsidian', 'blood-red', 'neon-cyan'],
    'jackets': ['obsidian', 'steel', 'blood-red'],
    'shorts': ['obsidian', 'bone', 'neon-violet'],
    'shoes': ['obsidian', 'bone', 'blood-red'],
    'collectibles': ['obsidian', 'neon-violet', 'neon-cyan'],
    'audio': ['obsidian', 'neon-cyan', 'neon-violet'],
}
ACCENTS = {
    't-shirts': ('magenta', 'red'), 'hoodies': ('cyan', 'violet'), 'pants': ('violet', 'cyan'),
    'mice': ('magenta', 'cyan'), 'keyboards': ('cyan', 'magenta'), 'accessories': ('violet', 'cyan'),
    'jackets': ('cyan', 'violet'), 'shorts': ('magenta', 'cyan'), 'shoes': ('violet', 'magenta'),
    'collectibles': ('magenta', 'violet'), 'audio': ('cyan', 'magenta'),
}
SIZES = {
    't-shirts': ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    'hoodies': ['S', 'M', 'L', 'XL', 'XXL'],
    'pants': ["'28'", "'30'", "'32'", "'34'", "'36'"],
    'mice': ['ONE_SIZE'], 'keyboards': ['ONE_SIZE'], 'accessories': ['ONE_SIZE'],
    'jackets': ['S', 'M', 'L', 'XL'], 'shorts': ['S', 'M', 'L', 'XL'],
    'shoes': ["'7'", "'8'", "'9'", "'10'", "'11'"],
    'collectibles': ['ONE_SIZE'], 'audio': ['ONE_SIZE'],
}
QUERIES = {
    't-shirts': ['graphic t shirt streetwear', 'printed tee fashion'],
    'hoodies': ['hoodie streetwear', 'fleece hoodie fashion'],
    'pants': ['cargo pants streetwear', 'streetwear trousers'],
    'mice': ['gaming mouse', 'wireless mouse'],
    'keyboards': ['mechanical keyboard', 'keyboard setup'],
    'accessories': ['streetwear cap', 'chain jewelry'],
    'jackets': ['bomber jacket streetwear', 'varsity jacket', 'windbreaker jacket'],
    'shorts': ['cargo shorts men', 'streetwear shorts'],
    'shoes': ['sneakers streetwear', 'black sneakers', 'running shoes'],
    'collectibles': ['anime figure collectible', 'action figure display'],
    'audio': ['gaming headset', 'wireless earbuds', 'bluetooth speaker'],
}

NEW = [
    # jackets
    ('chrome-bomber', 'Chrome Bomber Jacket', 'jackets', 12999, 'A satin bomber with ribbed cuffs and a chain-stitched back panel.'),
    (' Division-field-jacket'.strip(), 'Division Field Jacket', 'jackets', 14999, 'A utility field jacket with a storm flap and deep cargo pockets.'),
    (' midnight-varsity'.strip(), 'Midnight Varsity Jacket', 'jackets', 15999, 'Wool body, contrast sleeves and a snap-front closure.'),
    (' raven-windbreaker'.strip(), 'Raven Windbreaker', 'jackets', 9999, 'A packable shell with sealed seams and a neon zip pull.'),
    (' bloodline-denim-jacket', 'Bloodline Denim Jacket', 'jackets', 11999, 'Rigid denim with a cropped fit and contrast stitching.'),
    (' hunter-puffer', 'Hunter Puffer Jacket', 'jackets', 13999, 'Lightweight insulation with a matte finish and a high collar.'),
    (' neon-track-jacket', 'Neon Track Jacket', 'jackets', 8999, 'A slim track top with twin neon stripes down the sleeves.'),
    (' ghost-overcoat', 'Ghost Overcoat', 'jackets', 17999, 'A longline overcoat with a sharp shoulder and clean lapels.'),
    (' arc-softshell', 'Arc Softshell', 'jackets', 12499, 'A stretch softshell built for wind and late-night walks.'),
    (' siren-trench', 'Siren Trench', 'jackets', 16499, 'A belted trench with a glossy finish and chain detail.'),
    # shorts
    (' cargo-short-01', 'Utility Cargo Shorts', 'shorts', 4499, 'Above-knee cargo shorts with reinforced side pockets.'),
    (' street-short-02', 'Street Cycle Shorts', 'shorts', 3499, 'A close-fit cycle short with a subtle side print.'),
    (' denim-short-03', 'Washed Denim Shorts', 'shorts', 3999, 'A relaxed denim short with a vintage wash.'),
    (' track-short-04', 'Track Session Shorts', 'shorts', 2999, 'Lightweight shorts with an elastic waist and mesh lining.'),
    (' tactical-short-05', 'Tactical Shorts', 'shorts', 4999, 'Ripstop fabric with a modular pocket system.'),
    (' neon-short-06', 'Neon Edge Shorts', 'shorts', 3799, 'A bold side stripe and a contrast hem binding.'),
    (' gym-short-07', 'Training Shorts', 'shorts', 2799, 'Four-way stretch with a zip pocket and quick-dry finish.'),
    (' layered-short-08', 'Layered Utility Shorts', 'shorts', 4699, 'A layered look with an attached under-panel.'),
    # shoes
    (' concrete-runner', 'Concrete Runner', 'shoes', 14999, 'A cushioned runner with a reflective heel and a grippy outsole.'),
    (' midnight-high-top', 'Midnight High Top', 'shoes', 13999, 'A high-top silhouette with a padded collar and chain laces.'),
    (' chain-sneaker', 'Chain Low Sneaker', 'shoes', 12999, 'A low-profile sneaker with a sculpted side panel.'),
    (' bloodline-slip-on', 'Bloodline Slip-On', 'shoes', 9999, 'A laceless slip-on with an elasticated vamp.'),
    (' sector-trail', 'Sector Trail Shoe', 'shoes', 15999, 'A trail-ready shoe with aggressive grip and a rock plate.'),
    (' neon-court', 'Neon Court Shoe', 'shoes', 11999, 'A court classic with a neon accent and suede overlays.'),
    (' ghost-runner-2', 'Ghost Runner 2', 'shoes', 16999, 'A featherweight runner with a responsive foam midsole.'),
    (' steel-skate', 'Steel Skate Shoe', 'shoes', 10999, 'A durable suede skate shoe with a vulcanised sole.'),
    (' hunter-boot', 'Hunter Boot', 'shoes', 18999, 'A leather boot with a reinforced toe and a commando sole.'),
    (' pulse-slide', 'Pulse Slide', 'shoes', 4999, 'A cushioned slide with a moulded footbed.'),
    # collectibles
    (' fang-figure', 'Fang Figure 01', 'collectibles', 8999, 'A detailed 18 cm figure on a display base.'),
    (' chain-display', 'Chain Display Stand', 'collectibles', 3999, 'A steel display stand for figures and watches.'),
    (' devil-mask-replica', 'Devil Mask Replica', 'collectibles', 12999, 'A wearable resin mask with a hand-painted finish.'),
    (' holo-card-set', 'Holo Card Set', 'collectibles', 2999, 'A set of 24 foil cards in a collector tin.'),
    (' neon-poster-set', 'Neon Poster Set', 'collectibles', 3499, 'Three archival prints on heavyweight matte paper.'),
    (' mini-keyboard-charm', 'Mini Keyboard Charm', 'collectibles', 1999, 'A tiny mechanical keychain with clicky switches.'),
    (' hunter-enamel-pin', 'Hunter Enamel Pin', 'collectibles', 1499, 'A hard-enamel pin with a rubber clutch.'),
    (' figure-case', 'Figure Display Case', 'collectibles', 6999, 'A dust-proof case with a clear acrylic door.'),
    (' signed-print', 'Studio Print 01', 'collectibles', 5999, 'A numbered art print with a certificate card.'),
    (' chain-lanyard', 'Chain Lanyard', 'collectibles', 1799, 'A woven lanyard with a metal chain clip.'),
    # audio
    (' fang-earbuds', 'Fang Wireless Earbuds', 'audio', 8999, 'A compact case with 32-hour total playback.'),
    (' hunter-over-ear', 'Hunter Over-Ear', 'audio', 13999, 'Closed-back headphones with deep, controlled bass.'),
    (' desk-speaker', 'Desk Speaker Duo', 'audio', 11999, 'A stereo pair with a warm, detailed sound.'),
    (' broadcast-mic', 'Broadcast Microphone', 'audio', 15999, 'A cardioid condenser mic with a shock mount.'),
    (' neon-headphones', 'Neon Headphones', 'audio', 10999, 'Wireless over-ears with customisable light rings.'),
    (' pocket-speaker', 'Pocket Speaker', 'audio', 4999, 'A rugged mini speaker with a surprising low end.'),
    (' studio-monitor', 'Studio Monitor Single', 'audio', 17999, 'A reference monitor for a balanced desk setup.'),
    (' gaming-bud-pro', 'Gaming Buds Pro', 'audio', 9999, 'Low-latency earbuds with a detachable boom mic.'),
    # more core categories
    (' echo-tee', 'Echo Graphic Tee', 't-shirts', 2599, 'A soft tee with a tonal echo print.'),
    (' region-tee', 'Region 04 Tee', 't-shirts', 2699, 'A boxy tee with a district-inspired chest graphic.'),
    (' static-tee', 'Static Tee', 't-shirts', 2499, 'A heavy cotton tee with an abstract static print.'),
    (' runoff-tee', 'Runoff Tee', 't-shirts', 2399, 'A washed tee with a faded front mark.'),
    (' pulse-hoodie-v2', 'Pulse Hoodie V2', 'hoodies', 6299, 'An updated pullover with a double-layer hood.'),
    (' night-shift-hoodie', 'Night Shift Hoodie', 'hoodies', 6499, 'A deep-toned hoodie with reflective sleeve hits.'),
    (' echo-fleece', 'Echo Fleece', 'hoodies', 5999, 'Brushed fleece with a subtle tonal print.'),
    (' division-crew', 'Division Crewneck', 'hoodies', 5499, 'A clean crewneck with an embroidered crest.'),
    (' patrol-cargo-2', 'Patrol Cargo 2', 'pants', 6199, 'A refreshed cargo with articulated knees.'),
    (' shadow-chino', 'Shadow Chino', 'pants', 5499, 'A tapered chino in a deep charcoal twill.'),
    (' field-trouser', 'Field Trouser', 'pants', 5899, 'A relaxed trouser with a drawcord hem.'),
    (' utility-denim', 'Utility Denim', 'pants', 6299, 'Heavy denim with a utility pocket detail.'),
    (' tracer-mouse', 'Tracer Mouse', 'mice', 7499, 'A lightweight mouse with a 24K sensor.'),
    (' halo-mouse', 'Halo Mouse', 'mice', 6999, 'A symmetric shell with a soft matte coat.'),
    (' board-68', 'Board 68', 'keyboards', 10499, 'A 68% board with hot-swap sockets and a aluminium frame.'),
    (' type-s75', 'Type S75', 'keyboards', 11999, 'A gasket-mounted board with a rotary knob.'),
    (' utility-sling', 'Utility Sling', 'accessories', 4499, 'A compact sling with a padded strap.'),
    (' chain-wallet', 'Chain Wallet', 'accessories', 3499, 'A slim wallet with a stainless chain.'),
]


def search(query):
    html = subprocess.run(
        ['curl', '-fsSL', '--max-time', '30', f'https://www.pexels.com/search/{quote(query)}/', '-H', f'User-Agent: {UA}'],
        capture_output=True,
    ).stdout.decode('utf8', 'ignore')
    return list(dict.fromkeys(re.findall(r'images\.pexels\.com/photos/(\d+)/pexels-photo-\1\.jpeg', html)))


def download(photo_id, width=1000, height=1250):
    url = f'https://images.pexels.com/photos/{photo_id}/pexels-photo-{photo_id}.jpeg'
    data = urlopen(Request(f'{url}?auto=compress&cs=tinysrgb&w={width}&h={height}&fit=crop', headers=HEADERS), timeout=30).read()
    return Image.open(io.BytesIO(data)).convert('RGB'), url


def main():
    credits = Path('CREDITS.md').read_text().splitlines()
    pools = {}
    for category in QUERIES:
        ids = []
        for query in QUERIES[category]:
            try:
                ids.extend(search(query))
            except Exception:
                pass
        pools[category] = list(dict.fromkeys(ids))
        print(f'{category}: {len(pools[category])} candidate photos')

    count = 0
    for slug, name, category, price, description in NEW:
        # skip if already generated
        if (CONTENT / f'{slug}.md').exists():
            continue
        pool = pools.get(category, [])
        if len(pool) < 3:
            continue
        offset = random.randrange(len(pool))
        chosen = [pool[(offset + index) % len(pool)] for index in range(3)]
        accent_a, accent_b = ACCENTS.get(category, ('magenta', 'cyan'))
        paths = []
        for index, photo_id in enumerate(chosen):
            try:
                image, url = download(photo_id)
                dest = GALLERY / f'{slug}-{index + 1}.webp' if index > 0 else PRODUCTS / f'{slug}.webp'
                fs.save(image, dest, (800, 1000), accent_a, accent_b)
                credits.append(f'- `{slug}-{index + 1}`: {url}')
                paths.append(dest)
            except Exception as error:
                print(f'  ! {slug} image {index}: {error}')
        if len(paths) != 3:
            continue

        old = int(price / random.choice([0.7, 0.75, 0.8, 0.85]))
        brand = BRANDS[random.randrange(len(BRANDS))]
        colors = PALETTES[category]
        gallery_refs = ', '.join(f'../../assets/products/gallery/{slug}-{i}.webp' for i in (2, 3))
        gallery_alts = ', '.join(f'Alternate view {i} for {name}' for i in (2, 3))
        badge = 'Bestseller' if random.random() > 0.75 else ('New arrival' if random.random() > 0.5 else 'Limited drop')
        body = f"""---
id: p-{slug}
name: {name}
description: {description}
brand: {brand}
priceMinor: {price}
compareAtPriceMinor: {old}
currency: USD
category: {category}
cover: ../../assets/products/{slug}.webp
coverAlt: Product photography for {name}
gallery: [{gallery_refs}]
galleryAlt: [{gallery_alts}]
colors: [{', '.join(colors)}]
sizes: [{', '.join(SIZES[category])}]
seedLikeCount: {random.randint(25, 260)}
rating: {round(random.uniform(4.0, 4.9), 1)}
reviewCount: {random.randint(8, 640)}
featured: {'true' if random.random() > 0.88 else 'false'}
createdAt: '2026-{random.randint(8, 11):02d}-{random.randint(1, 28):02d}T10:00:00.000Z'
---

# {name}

{description}
"""
        (CONTENT / f'{slug}.md').write_text(body)
        count += 1

    # new categories
    new_categories = [
        ('jackets', 'Jackets', 'Outerwear with weight, structure and attitude.', 'cyan'),
        ('shorts', 'Shorts', 'Warm-weather cuts with utility in mind.', 'magenta'),
        ('shoes', 'Shoes', 'Sneakers and boots built for concrete.', 'violet'),
        ('collectibles', 'Collectibles', 'Figures, prints and objects for the shelf.', 'red'),
        ('audio', 'Audio', 'Sound gear for the desk and beyond.', 'cyan'),
    ]
    cat_dir = Path('src/content/categories')
    for slug, name, description, accent in new_categories:
        art = next((p for p in GALLERY.glob(f'*.webp') if slug in p.name), None)
        image_line = f'image: ../../assets/products/gallery/{art.name}\n' if art else ''
        (cat_dir / f'{slug}.md').write_text(
            f'---\nname: {name}\nslug: {slug}\ndescription: {description}\naccent: {accent}\n{image_line}---\n\n# {name}\n\n{description}\n'
        )

    # extra banners
    for name, query, title, subtitle in [
        ('banner-new', 'streetwear fashion', '', ''),
        ('banner-collect', 'collectible figures', '', ''),
        ('banner-audio', 'headphones neon', '', ''),
    ]:
        try:
            ids = search(query)
            image, url = download(ids[0], 1800, 700)
            graded = fs.grade(image, (1600, 500), 'magenta', 'cyan')
            graded.save(BANNERS / f'{name}.webp', 'WEBP', quality=68, method=6)
            credits.append(f'- `banner:{name}`: {url}')
        except Exception as error:
            print(f'  ! banner {name}: {error}')

    Path('CREDITS.md').write_text('\n'.join(credits) + '\n')
    print(f'Added {count} products, 5 categories and extra banners. Total: {len(list(CONTENT.glob("*.md")))} products')


if __name__ == '__main__':
    main()
