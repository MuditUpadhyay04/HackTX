"""What Un-Said itself says, in one place for Gurneal to review.

GURNEAL: from design/COPY_AND_NAMES.md, used exactly.
PROPOSED: needed, not in the copy file yet. Listed under COPY NEEDED in mobile/README.md.
Rules: sentence case, never "we detected", "risk", "depressed" or "sad", no guilt, no streaks.
"""

APP_NAME = "Un-Said"  # GURNEAL

# The knock (COPY_AND_NAMES 3.15). GURNEAL.
KNOCK_A = "We noticed you've been quieter with the people closest to you lately. Want to say what you haven't?"
_KNOCK_B_TAIL = "Some things are easier to say here first."

# After he records about someone he's held words for before. PROPOSED (Mudit's line).
ENCOURAGE = "Tell them how you feel. Communication helps."

# Push when a held letter's moment comes and it needs his tap. PROPOSED.
READY_PUSH = "It's {time} for {name}. Send it now?"


def knock_b(names: list[str]) -> str:
    """Body B. With three people it is Gurneal's line exactly; with two it's a PROPOSED variant."""
    if len(names) >= 3:
        return f"{', '.join(names[:-1])} and {names[-1]} all reached out this week. {_KNOCK_B_TAIL}"
    return f"{names[0]} and {names[1]} both reached out this week. {_KNOCK_B_TAIL}"
