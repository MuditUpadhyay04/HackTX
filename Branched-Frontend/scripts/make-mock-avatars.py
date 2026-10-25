"""
scripts/make-mock-avatars.py: draws the illustrated avatars for the background chats that fill the
WhatsApp, Messages and Instagram inboxes under the main threads (our own art, no real people), in the
same flat style as the hand-drawn cast avatars. Writes public/mock/avatar-<id>.svg (240x240).
Run: python3 scripts/make-mock-avatars.py
"""
import os

OUT = os.path.join(os.path.dirname(__file__), "..", "public", "mock")


def wrap(id_, bg, body, note):
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" width="240" height="240">
  <!-- Branched-Frontend: {note}, illustrated avatar (our own art; no real person). -->
  <defs>
    <radialGradient id="bg-{id_}" cx="0.3" cy="0.25" r="0.95"><stop offset="0" stop-color="{bg[0]}"/><stop offset="1" stop-color="{bg[1]}"/></radialGradient>
  </defs>
  <rect width="240" height="240" fill="url(#bg-{id_})"/>
  {body}
</svg>
'''


def hair_back(style, c):
    if style == "long":
        return f'<path d="M70 120c-6-50 18-78 50-78s56 28 50 78c-2 30 6 50 14 70H56c8-20 16-40 14-70z" fill="{c}"/>'
    if style == "curly":
        dots = [(78, 96), (84, 74), (100, 60), (120, 54), (140, 60), (156, 74), (162, 96), (74, 118), (166, 118)]
        return "".join(f'<circle cx="{x}" cy="{y}" r="17" fill="{c}"/>' for x, y in dots)
    return ""


def hair_front(style, c):
    if style == "long":
        return (
            f'<path d="M82 112c0-34 16-54 40-54 22 0 38 18 38 46-10-14-22-24-36-28-12 12-26 22-42 36z" fill="{c}"/>'
            f'<path d="M82 104c-6 22-4 46 4 64-14-10-20-30-16-52z" fill="{c}"/>'
            f'<path d="M158 104c6 22 4 46-4 64 14-10 20-30 16-52z" fill="{c}"/>'
        )
    if style == "bun":
        return (
            f'<circle cx="120" cy="52" r="18" fill="{c}"/>'
            f'<path d="M80 108c-2-32 16-48 40-48s42 16 40 48c-6-14-20-24-40-24s-34 10-40 24z" fill="{c}"/>'
        )
    if style == "curly":
        return f'<path d="M84 100c4-22 18-34 36-34s32 12 36 34c-10-8-22-12-36-12s-26 4-36 12z" fill="{c}"/>'
    if style == "buzz":
        return f'<path d="M82 104c0-28 16-44 38-44s38 16 38 44c-8-12-22-18-38-18s-30 6-38 18z" fill="{c}"/>'
    if style == "cap":
        return (
            f'<path d="M80 102c0-28 18-44 40-44s40 16 40 44z" fill="{c}"/>'
            f'<path d="M150 96c14 0 26 4 30 10H146z" fill="{c}"/>'
        )
    # short, swept
    return f'<path d="M80 108c-2-32 16-50 40-50s44 16 40 46c-4-10-12-18-22-22-10 6-24 8-36 6-8 4-16 10-22 20z" fill="{c}"/>'


def person(id_, note, bg, skin, hair, style, shirt, glasses=False, beard=None, gray=False):
    shade = skin[1]
    parts = [
        hair_back(style, hair),
        f'<path d="M40 240c4-42 36-66 80-66s76 24 80 66z" fill="{shirt}"/>',
        f'<path d="M106 150h28v24c0 8-6 13-14 13s-14-5-14-13z" fill="{shade}"/>',
        f'<ellipse cx="80" cy="116" rx="6" ry="9" fill="{shade}"/><ellipse cx="160" cy="116" rx="6" ry="9" fill="{shade}"/>',
        f'<ellipse cx="120" cy="114" rx="38" ry="44" fill="{skin[0]}"/>',
        hair_front(style, hair),
    ]
    if beard:
        parts.append(f'<path d="M84 122c2 26 16 40 36 40s34-14 36-40c-6 12-18 16-36 16s-30-4-36-16z" fill="{beard}"/>')
    parts += [
        '<ellipse cx="105" cy="118" rx="3.4" ry="4.2" fill="#2E2218"/><ellipse cx="135" cy="118" rx="3.4" ry="4.2" fill="#2E2218"/>',
        f'<path d="M98 108c4-3 10-3 13-1M129 107c4-2 9-2 13 1" fill="none" stroke="{"#8E8A84" if gray else "#3A2A20"}" stroke-width="2.4" stroke-linecap="round"/>',
        f'<path d="M120 122c-1 5-2 8-5 10 2 1 5 1 7 0" fill="none" stroke="{shade}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>',
        '<path d="M110 141c6 5 14 5 20 0" fill="none" stroke="#9C4E48" stroke-width="3" stroke-linecap="round"/>',
        '<ellipse cx="100" cy="132" rx="7" ry="4" fill="#EE9C91" opacity="0.35"/><ellipse cx="140" cy="132" rx="7" ry="4" fill="#EE9C91" opacity="0.35"/>',
    ]
    if glasses:
        parts.append(
            '<circle cx="105" cy="117" r="11" fill="none" stroke="#2E2A27" stroke-width="2.6"/>'
            '<circle cx="135" cy="117" r="11" fill="none" stroke="#2E2A27" stroke-width="2.6"/>'
            '<path d="M116 116h8" stroke="#2E2A27" stroke-width="2.6"/>'
        )
    return wrap(id_, bg, "\n  ".join(p for p in parts if p), note)


def badge(id_, note, bg, art):
    return wrap(id_, bg, art, note)


LIGHT, MED, TAN, DEEP = ("#F2C9AA", "#D9A887"), ("#E2AE88", "#C99470"), ("#C98E66", "#AE7650"), ("#8E5B3E", "#764830")

AVATARS = {
    # WhatsApp
    "priya": person("priya", "Priya", ("#FCE3D6", "#F2BFA6"), TAN, "#2A1C16", "long", "#3E7C74"),
    "nani": person("nani", "Nani", ("#F4E9D2", "#E2D0A8"), TAN, "#C9C4BC", "bun", "#B0485E", glasses=True, gray=True),
    "masi": person("masi", "Neha Masi", ("#E4F0E4", "#BFD8C0"), MED, "#241812", "bun", "#D9822B"),
    "omar": person("omar", "Omar", ("#E0EAF6", "#BACBE4"), MED, "#1E1612", "buzz", "#3B3F55", beard="#1E1612"),
    "studygroup": badge(
        "studygroup",
        "CH 301 Study Group",
        ("#E2F2EE", "#A9D6CB"),
        '<path d="M100 52h40v12h-6v44l42 72c6 10-2 22-14 22H78c-12 0-20-12-14-22l42-72V64h-6z" fill="#F7FBFA" stroke="#2F6F62" stroke-width="6" stroke-linejoin="round"/>'
        '<path d="M86 142h68l22 38c6 10-2 22-14 22H78c-12 0-20-12-14-22z" fill="#3FB49A"/>'
        '<circle cx="108" cy="172" r="7" fill="#E8FFF8" opacity="0.8"/><circle cx="132" cy="158" r="5" fill="#E8FFF8" opacity="0.8"/><circle cx="124" cy="186" r="4" fill="#E8FFF8" opacity="0.8"/>',
    ),
    "soccer": badge(
        "soccer",
        "IM Soccer",
        ("#DDF2D0", "#9CCF7E"),
        '<circle cx="120" cy="120" r="70" fill="#FFFFFF" stroke="#1F2A1C" stroke-width="5"/>'
        '<path d="M120 92l26 19-10 31h-32l-10-31z" fill="#1F2A1C"/>'
        '<path d="M120 92V52M146 111l36-14M136 142l22 32M104 142l-22 32M94 111l-36-14" stroke="#1F2A1C" stroke-width="5"/>'
        '<path d="M104 52l16-2 16 2-16 10zM182 97l2 18-8 14-4-18zM158 174l-14 10-18 2 12-14zM82 174l14 10 18 2-12-14zM58 97l-2 18 8 14 4-18z" fill="#1F2A1C"/>',
    ),
    # Messages
    "ethan": person("ethan", "Ethan", ("#E6E4F8", "#C3BEEA"), LIGHT, "#B8823E", "cap", "#C0392B"),
    "lena": person("lena", "Lena", ("#FFF1D6", "#F5D59A"), LIGHT, "#5A3A24", "curly", "#5A6FA8", glasses=True),
    "clinic": badge(
        "clinic",
        "UT Health Austin",
        ("#D8DCE2", "#A9AFB9"),
        '<text x="120" y="142" text-anchor="middle" font-family="-apple-system, Helvetica, Arial, sans-serif" font-size="72" font-weight="600" fill="#FFFFFF">UH</text>',
    ),
    # Instagram
    "jess": person("jess", "Jess Nguyen", ("#FFE0EC", "#F6B3CC"), LIGHT, "#1C1714", "long", "#2B2B2B"),
    "marcus": person("marcus", "Marcus Webb", ("#DCEBFA", "#A8C9EE"), DEEP, "#16110E", "buzz", "#E0A63A"),
    "ava": person("ava", "Ava Lopez", ("#FDE8D8", "#F3C2A0"), MED, "#6A3B22", "long", "#7C5CC4"),
    "dani": person("dani", "Dani Reyes", ("#E2F4F1", "#A8DDD4"), TAN, "#2A1A12", "bun", "#E86A4A"),
    "outdoors": badge(
        "outdoors",
        "UT Outdoors Club",
        ("#FFE3C4", "#F5B27A"),
        '<circle cx="160" cy="78" r="22" fill="#FFF4DC"/>'
        '<path d="M20 196l64-96 34 48 26-34 76 82z" fill="#2F5E4E"/>'
        '<path d="M84 100l14 21-10-4-10 10-8-6z" fill="#F7F3EA"/>'
        '<path d="M0 240v-40c40-14 80-14 120-4s80 10 120-2v46z" fill="#1E4438"/>',
    ),
}

for id_, svg in AVATARS.items():
    with open(os.path.join(OUT, f"avatar-{id_}.svg"), "w") as f:
        f.write(svg)
print(f"wrote {len(AVATARS)} avatars to {os.path.normpath(OUT)}")
