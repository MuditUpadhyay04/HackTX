"""
scripts/make-mock-photos.py: draws the illustrated "photos" the look-alike apps show (our own art,
no real people or places): the story's images (Mom's dal, the 290 sunrise, the Fam kitchen, the Marfa
lake) and Riley's camera roll for Photos. Writes public/mock/photos/<id>.svg (3:4 portrait, 900x1200).
Run: python3 scripts/make-mock-photos.py
"""
import math, os, random

OUT = os.path.join(os.path.dirname(__file__), "..", "public", "mock", "photos")
W, H = 900, 1200

def svg(body, defs=""):
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}"><defs>{defs}<filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0.07 0"/></filter><filter id="soft"><feGaussianBlur stdDeviation="6"/></filter><filter id="blur20"><feGaussianBlur stdDeviation="20"/></filter></defs>{body}<rect width="{W}" height="{H}" filter="url(#grain)"/></svg>'

def lin(id_, stops, x2=0, y2=1):
    s = "".join(f'<stop offset="{o}" stop-color="{c}"/>' for o, c in stops)
    return f'<linearGradient id="{id_}" x1="0" y1="0" x2="{x2}" y2="{y2}">{s}</linearGradient>'

def rad(id_, stops, cx=0.5, cy=0.5, r=0.5):
    s = "".join(f'<stop offset="{o}" stop-color="{c}" stop-opacity="{a}"/>' for o, c, a in stops)
    return f'<radialGradient id="{id_}" cx="{cx}" cy="{cy}" r="{r}">{s}</radialGradient>'

def hills(y, amp, color, seed, n=6, opacity=1):
    rnd = random.Random(seed)
    pts = [(0, y)]
    for i in range(1, n + 1):
        pts.append((W * i / n, y - rnd.uniform(0, amp)))
    d = f"M0 {H} L0 {y} " + " ".join(f"Q{(pts[i-1][0]+pts[i][0])/2} {pts[i][1]-amp*0.3} {pts[i][0]} {pts[i][1]}" for i in range(1, len(pts))) + f" L{W} {H} Z"
    return f'<path d="{d}" fill="{color}" opacity="{opacity}"/>'

# ---------------------------------------------------------------- scene templates

def sunset(sky, sun, layers, seed, sun_y=0.55):
    defs = lin("sky", sky) + rad("sun", [(0, sun, 1), (0.25, sun, 0.55), (1, sun, 0)])
    body = f'<rect width="{W}" height="{H}" fill="url(#sky)"/><circle cx="{W*0.55}" cy="{H*sun_y}" r="420" fill="url(#sun)"/><circle cx="{W*0.55}" cy="{H*sun_y}" r="58" fill="#FFF4D6"/>'
    for i, (y, amp, c) in enumerate(layers):
        body += hills(H * y, amp, c, seed + i)
    return svg(body, defs)

def highway_sunrise():
    defs = lin("sky", [(0, "#2B3A67"), (0.38, "#E58C68"), (0.55, "#F8C779"), (0.62, "#F6E1A8")]) + rad("sun", [(0, "#FFE7A8", 1), (0.3, "#FFC56B", 0.6), (1, "#FFB35C", 0)])
    body = f'<rect width="{W}" height="{H}" fill="url(#sky)"/><circle cx="450" cy="700" r="380" fill="url(#sun)"/><circle cx="450" cy="702" r="46" fill="#FFF3D2"/>'
    body += hills(H * 0.6, 40, "#5B4B5E", 3, opacity=0.8)
    body += f'<path d="M0 760 L900 760 L900 1200 L0 1200Z" fill="#3C3442"/>'
    body += f'<path d="M430 760 L470 760 L760 1200 L140 1200Z" fill="#4A4250"/>'
    for i in range(6):
        y0 = 780 + i * 70 + i * i * 6; y1 = y0 + 30 + i * 8
        x = 450; w0 = 3 + i * 2.2; w1 = w0 + 3
        body += f'<path d="M{x-w0} {y0} L{x+w0} {y0} L{x+w1} {y1} L{x-w1} {y1}Z" fill="#F4D58A" opacity="0.85"/>'
    # car hood + two silhouettes from behind
    body += '<path d="M60 1200 C120 1020 300 960 450 960 C600 960 780 1020 840 1200Z" fill="#1E1B24"/>'
    body += '<path d="M120 1060 C260 1000 640 1000 780 1060" fill="none" stroke="#5E5566" stroke-width="5" opacity="0.6"/>'
    for cx, s in ((370, 1.0), (520, 1.06)):
        body += f'<g transform="translate({cx} 905) scale({s})"><ellipse cx="0" cy="0" rx="34" ry="40" fill="#141218"/><path d="M-70 120 C-70 50 -40 32 0 32 C40 32 70 50 70 120Z" fill="#141218"/></g>'
    return svg(body, defs)

def dal():
    defs = rad("light", [(0, "#FFF2D9", 1), (1, "#C9A27A", 1)], 0.4, 0.3, 0.9) + rad("dal", [(0, "#F2B640", 1), (0.7, "#D98E1F", 1), (1, "#B86F14", 1)]) + lin("steel", [(0, "#E9ECEF"), (0.5, "#A9AFB6"), (1, "#7C838B")], 1, 0)
    body = f'<rect width="{W}" height="{H}" fill="url(#light)"/>'
    body += '<rect x="0" y="760" width="900" height="440" fill="#3B3633"/><rect x="0" y="760" width="900" height="16" fill="#2A2624"/>'
    for x in (180, 720):
        body += f'<ellipse cx="{x}" cy="1010" rx="150" ry="46" fill="#1E1B1A"/><ellipse cx="{x}" cy="1004" rx="120" ry="34" fill="none" stroke="#4A4442" stroke-width="10"/>'
    body += '<ellipse cx="450" cy="900" rx="300" ry="78" fill="#1E1B1A"/>'
    body += '<path d="M170 640 L170 880 C170 930 730 930 730 880 L730 640Z" fill="url(#steel)"/>'
    body += '<ellipse cx="450" cy="640" rx="280" ry="74" fill="#C9CED3"/><ellipse cx="450" cy="648" rx="258" ry="62" fill="url(#dal)"/>'
    rnd = random.Random(7)
    for _ in range(26):
        x = 450 + rnd.uniform(-220, 220); y = 648 + rnd.uniform(-40, 40)
        body += f'<circle cx="{x:.0f}" cy="{y:.0f}" r="{rnd.uniform(4,9):.1f}" fill="#7A4A12" opacity="0.55"/>'
    for _ in range(9):
        x = 450 + rnd.uniform(-180, 180); y = 645 + rnd.uniform(-30, 30)
        body += f'<path d="M{x:.0f} {y:.0f} q8 -12 18 -2 q-8 10 -18 2Z" fill="#3E7D2C"/>'
    body += '<path d="M690 610 C760 520 820 470 880 450" stroke="#2D2A28" stroke-width="22" stroke-linecap="round" fill="none"/>'
    for i in range(3):
        x = 360 + i * 90
        body += f'<path d="M{x} 560 C{x-30} 500 {x+30} 460 {x} 400 C{x-30} 350 {x+20} 320 {x} 280" fill="none" stroke="#FFFFFF" stroke-width="12" stroke-linecap="round" opacity="0.18" filter="url(#soft)"/>'
    return svg(body, defs)

def kitchen():
    defs = lin("wall", [(0, "#F4E6D4"), (1, "#E7D2B8")]) + rad("win", [(0, "#FFF8E8", 1), (1, "#FFE3B5", 1)])
    body = f'<rect width="{W}" height="{H}" fill="url(#wall)"/>'
    body += '<rect x="520" y="140" width="300" height="360" rx="10" fill="#C79A6B"/><rect x="540" y="160" width="260" height="320" fill="url(#win)"/><path d="M670 160 V480 M540 320 H800" stroke="#C79A6B" stroke-width="12"/>'
    body += '<rect x="60" y="180" width="380" height="200" rx="8" fill="#B4855A"/><rect x="72" y="192" width="176" height="176" rx="6" fill="#C79A6B"/><rect x="252" y="192" width="176" height="176" rx="6" fill="#C79A6B"/>'
    body += '<rect x="0" y="640" width="900" height="40" fill="#8E6A4A"/><rect x="0" y="680" width="900" height="520" fill="#A57C57"/>'
    for x in (40, 330, 620):
        body += f'<rect x="{x}" y="720" width="250" height="420" rx="10" fill="#B38A63"/><rect x="{x+110}" y="780" width="30" height="8" rx="4" fill="#5C4330"/>'
    body += '<ellipse cx="250" cy="630" rx="120" ry="20" fill="#7A5A3C"/><path d="M150 560 h200 l-10 70 h-180Z" fill="#C0392B"/>'
    body += '<rect x="560" y="560" width="70" height="80" rx="10" fill="#2E86AB"/><rect x="650" y="580" width="60" height="60" rx="8" fill="#F1C40F"/>'
    body += '<g fill="#5E8C3A"><ellipse cx="600" cy="540" rx="16" ry="30"/><ellipse cx="620" cy="530" rx="14" ry="26"/><ellipse cx="585" cy="530" rx="12" ry="24"/></g>'
    return svg(body, defs)

def lake():
    return sunset([(0, "#7FB7E6"), (0.45, "#BFDDF2"), (0.5, "#9BC7DE")], "#FFFFFF",
                  [(0.47, 120, "#7B8C9C"), (0.5, 60, "#56707F")], 11, sun_y=0.2).replace(
        "</svg>", '<rect x="0" y="600" width="900" height="600" fill="#5E93B3" opacity="0.92"/><g opacity="0.5">' +
        "".join(f'<rect x="{random.Random(i).randint(0,800)}" y="{620+i*28}" width="{random.Random(i+50).randint(60,240)}" height="3" rx="1.5" fill="#E6F2FA"/>' for i in range(20)) +
        '</g><path d="M0 1080 C200 1040 400 1100 900 1060 L900 1200 L0 1200Z" fill="#6E5B3F"/></svg>')

def city_night(seed):
    rnd = random.Random(seed)
    defs = lin("sky", [(0, "#0B1026"), (0.7, "#2B2457"), (1, "#5A3A6B")])
    body = f'<rect width="{W}" height="{H}" fill="url(#sky)"/>'
    x = 0
    while x < W:
        w = rnd.randint(70, 150); h = rnd.randint(300, 760)
        body += f'<rect x="{x}" y="{H-h}" width="{w}" height="{h}" fill="#141327"/>'
        for wy in range(H - h + 20, H - 20, 34):
            for wx in range(x + 12, x + w - 12, 24):
                if rnd.random() < 0.45:
                    body += f'<rect x="{wx}" y="{wy}" width="12" height="16" fill="#FFD68A" opacity="{rnd.uniform(0.4,0.95):.2f}"/>'
        x += w + rnd.randint(4, 14)
    for _ in range(40):
        body += f'<circle cx="{rnd.randint(0,W)}" cy="{rnd.randint(0,420)}" r="{rnd.uniform(0.8,2):.1f}" fill="#FFFFFF" opacity="{rnd.uniform(0.3,0.9):.2f}"/>'
    return svg(body, defs)

def beach(seed):
    defs = lin("sky", [(0, "#4FA3E0"), (0.5, "#A7D8F5")]) + lin("sea", [(0, "#1C7FB5"), (1, "#5CC3D6")])
    body = f'<rect width="{W}" height="{H}" fill="url(#sky)"/><rect y="520" width="{W}" height="320" fill="url(#sea)"/>'
    body += '<path d="M0 820 C220 780 520 860 900 800 L900 1200 L0 1200Z" fill="#F2DDB0"/><path d="M0 820 C220 780 520 860 900 800" fill="none" stroke="#FFFFFF" stroke-width="14" opacity="0.8"/>'
    rnd = random.Random(seed)
    for _ in range(5):
        x = rnd.randint(80, 820)
        body += f'<ellipse cx="{x}" cy="{rnd.randint(140,320)}" rx="{rnd.randint(70,130)}" ry="26" fill="#FFFFFF" opacity="0.85"/>'
    body += '<g transform="translate(680 980)"><path d="M0 0 L-6 -260" stroke="#7A5230" stroke-width="10"/><path d="M-6 -260 C-80 -300 -150 -270 -190 -230 M-6 -260 C60 -310 130 -290 170 -250 M-6 -260 C-40 -330 -10 -380 30 -390" fill="none" stroke="#2F7D3A" stroke-width="26" stroke-linecap="round"/></g>'
    return svg(body, defs)

def food(seed, bowl, base, dots):
    rnd = random.Random(seed)
    defs = rad("bg", [(0, base, 1), (1, "#2B2522", 1)], 0.5, 0.45, 0.8)
    body = f'<rect width="{W}" height="{H}" fill="url(#bg)"/><ellipse cx="450" cy="640" rx="360" ry="360" fill="#F4F1EC"/><ellipse cx="450" cy="640" rx="300" ry="300" fill="{bowl}"/>'
    for _ in range(60):
        c = rnd.choice(dots)
        body += f'<circle cx="{450+rnd.uniform(-240,240):.0f}" cy="{640+rnd.uniform(-240,240):.0f}" r="{rnd.uniform(10,34):.0f}" fill="{c}" opacity="0.9"/>'
    body += '<rect x="780" y="300" width="22" height="640" rx="11" fill="#C8C2BA" transform="rotate(12 790 620)"/>'
    return svg(body, defs)

def coffee(seed):
    defs = lin("tbl", [(0, "#8A6244"), (1, "#5E412D")]) + rad("cr", [(0, "#E9C79A", 1), (0.55, "#B07A45", 1), (1, "#6B4426", 1)])
    body = f'<rect width="{W}" height="{H}" fill="url(#tbl)"/>'
    for i in range(0, H, 90):
        body += f'<path d="M0 {i} C300 {i+30} 600 {i-20} 900 {i+10}" stroke="#4B3424" stroke-width="3" opacity="0.4" fill="none"/>'
    body += '<ellipse cx="450" cy="620" rx="330" ry="330" fill="#F5F2EE"/><circle cx="450" cy="600" r="230" fill="#FFFFFF"/><circle cx="450" cy="600" r="200" fill="url(#cr)"/>'
    body += '<path d="M450 470 C390 520 390 600 450 640 C510 600 510 520 450 470Z M450 640 L450 720" fill="#F3DFC1" stroke="#F3DFC1" stroke-width="6" opacity="0.9"/>'
    body += '<path d="M680 560 C780 560 780 680 680 670" fill="none" stroke="#F5F2EE" stroke-width="30"/>'
    return svg(body, defs)

def dog(seed):
    defs = lin("bg", [(0, "#BFE3F7"), (1, "#7FC6A4")])
    body = f'<rect width="{W}" height="{H}" fill="url(#bg)"/><rect y="760" width="{W}" height="440" fill="#5DAA6B"/>'
    body += '<g transform="translate(450 760)"><ellipse cx="0" cy="40" rx="230" ry="150" fill="#D79A4C"/><circle cx="-170" cy="-130" r="120" fill="#D79A4C"/><ellipse cx="-270" cy="-90" rx="60" ry="40" fill="#E4B477"/><circle cx="-320" cy="-100" r="18" fill="#2A1C12"/><circle cx="-190" cy="-170" r="14" fill="#2A1C12"/><path d="M-110 -230 C-60 -260 -40 -180 -80 -120Z" fill="#B97A33"/><path d="M-200 -80 q-20 60 10 90" stroke="#C0392B" stroke-width="18" stroke-linecap="round" fill="none"/>'
    body += '<rect x="-180" y="120" width="44" height="120" rx="20" fill="#D79A4C"/><rect x="120" y="120" width="44" height="120" rx="20" fill="#D79A4C"/><path d="M220 0 C300 -60 320 -140 300 -180" stroke="#D79A4C" stroke-width="40" stroke-linecap="round" fill="none"/></g>'
    return svg(body, defs)

def concert(seed):
    rnd = random.Random(seed)
    defs = rad("st", [(0, "#FF4FD8", 1), (0.5, "#6A2BD9", 0.8), (1, "#0D0620", 1)], 0.5, 0.35, 0.8)
    body = f'<rect width="{W}" height="{H}" fill="url(#st)"/>'
    for i in range(6):
        x = 120 + i * 130
        body += f'<path d="M{x} 0 L{x-120} 900 L{x+120} 900Z" fill="#FFFFFF" opacity="0.07"/>'
    for _ in range(60):
        x = rnd.randint(-20, 920); y = rnd.randint(860, 1100); r = rnd.randint(36, 60)
        body += f'<circle cx="{x}" cy="{y}" r="{r}" fill="#0A0514"/><rect x="{x-r}" y="{y}" width="{2*r}" height="300" fill="#0A0514"/>'
    for _ in range(8):
        x = rnd.randint(60, 840)
        body += f'<rect x="{x}" y="{rnd.randint(700,820)}" width="46" height="80" rx="8" fill="#151020" stroke="#FFFFFF" stroke-opacity="0.5"/><rect x="{x+6}" y="{rnd.randint(706,726)}" width="34" height="52" rx="4" fill="#FFE9A8" opacity="0.8"/>'
    return svg(body, defs)

def mountains(seed):
    return sunset([(0, "#9EC8EA"), (0.6, "#E3EEF7")], "#FFFFFF",
                  [(0.55, 360, "#8695A9"), (0.62, 260, "#5F6E84"), (0.72, 160, "#3E5A49"), (0.85, 90, "#2E4637")], seed, sun_y=0.18)

def campus(seed):
    defs = lin("sky", [(0, "#6FB1E8"), (1, "#CFE7F7")])
    body = f'<rect width="{W}" height="{H}" fill="url(#sky)"/>'
    body += '<rect x="330" y="200" width="240" height="700" fill="#E9D8B4"/><path d="M310 200 L450 90 L590 200Z" fill="#C9B48C"/><rect x="420" y="110" width="60" height="90" fill="#E9D8B4"/>'
    for y in range(260, 860, 90):
        for x in (360, 430, 500):
            body += f'<rect x="{x}" y="{y}" width="40" height="60" rx="18" fill="#7D8EA3"/>'
    body += '<circle cx="450" cy="150" r="22" fill="#FFFFFF" stroke="#6B5B3E" stroke-width="5"/>'
    body += '<rect x="0" y="880" width="900" height="320" fill="#6FA35A"/><path d="M380 1200 L420 880 L480 880 L520 1200Z" fill="#D9CDB4"/>'
    for x in (120, 760):
        body += f'<rect x="{x-10}" y="760" width="20" height="160" fill="#6B4A2E"/><circle cx="{x}" cy="720" r="110" fill="#3F7D3A"/>'
    return svg(body, defs)

def screenshot_note(seed):
    body = f'<rect width="{W}" height="{H}" fill="#FFFFFF"/><rect width="{W}" height="140" fill="#F7F7F7"/>'
    rnd = random.Random(seed)
    y = 220
    for _ in range(14):
        body += f'<rect x="70" y="{y}" width="{rnd.randint(380,760)}" height="22" rx="11" fill="#D8D8DC"/>'
        y += 62
    body += '<rect x="70" y="60" width="200" height="36" rx="10" fill="#E2B93B"/>'
    return svg(body)

# ---------------------------------------------------------------- the set

PHOTOS = {
    # story images (CLAUDE_PROMPT.md Phase 2; lib/mock/threads.ts imageId)
    "dal": dal(),
    "sunrise-290": highway_sunrise(),
    "kitchen": kitchen(),
    "lake": lake(),
    # Riley's camera roll
    "roll-01": campus(1),
    "roll-02": coffee(2),
    "roll-03": city_night(3),
    "roll-04": sunset([(0, "#3D2C6B"), (0.5, "#E9785B"), (0.7, "#FBC27A")], "#FFD9A0", [(0.7, 120, "#4B2F4F"), (0.8, 80, "#2E1E33")], 4),
    "roll-05": dog(5),
    "roll-06": food(6, "#E8D3A9", "#6E5A48", ["#C0392B", "#27AE60", "#F39C12", "#ECF0F1"]),
    "roll-07": beach(7),
    "roll-08": concert(8),
    "roll-09": mountains(9),
    "roll-10": screenshot_note(10),
    "roll-11": city_night(11),
    "roll-12": coffee(12),
    "roll-13": sunset([(0, "#1F4E79"), (0.55, "#F4A259"), (0.7, "#F6D58E")], "#FFE8B0", [(0.68, 140, "#5B6B5A"), (0.82, 70, "#2F3A2E")], 13),
    "roll-14": food(14, "#F3E0C2", "#4E3B30", ["#F2B640", "#3E7D2C", "#D35400"]),
    "roll-15": campus(15),
    "roll-16": beach(16),
    "roll-17": mountains(17),
    "roll-18": concert(18),
    "roll-19": dog(19),
    "roll-20": sunset([(0, "#5B3A8C"), (0.5, "#F06C9B"), (0.75, "#FFC4A3")], "#FFE0C8", [(0.72, 100, "#3B2747"), (0.86, 60, "#22172B")], 20),
}

os.makedirs(OUT, exist_ok=True)
for name, content in PHOTOS.items():
    with open(os.path.join(OUT, f"{name}.svg"), "w") as f:
        f.write(content)
print(f"wrote {len(PHOTOS)} photos to {os.path.relpath(OUT)}")
