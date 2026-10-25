"""What Un-Said itself says, in one place for Gurneal to review.

GURNEAL: from design/COPY_AND_NAMES.md, used exactly.
PROPOSED: needed, not in the copy file yet. Listed under COPY NEEDED in mobile/README.md.
Rules: sentence case, never "we detected", "risk", "depressed" or "sad", no guilt, no streaks.
"""

APP_NAME = "Un-Said"  # GURNEAL

# The knock (COPY_AND_NAMES 3.15). GURNEAL.
KNOCK_A = "We noticed you've been quieter with the people closest to you lately. Want to say what you haven't?"
_KNOCK_B_TAIL = "Some things are easier to say here first."

# DEMO (needs Gurneal's OK). The live demo at the judging table (Demo mode): the knock after he
# lingers 8 s on a photo, then the line at the top of Talk when he opens it.
KNOCK_DEMO = "You miss them, right?"
TALK_DEMO = "Send the words you're keeping to yourself. They're waiting for your answer."

# After he records about someone he's held words for before. PROPOSED (Mudit's line).
ENCOURAGE = "Tell them how you feel. Communication helps."

# Push when a held letter's moment comes and it needs his tap. PROPOSED.
READY_PUSH = "It's {time} for {name}. Send it now?"


def knock_b(names: list[str]) -> str:
    """Body B. With three people it is Gurneal's line exactly; with two it's a PROPOSED variant."""
    if len(names) >= 3:
        return f"{', '.join(names[:-1])} and {names[-1]} all reached out this week. {_KNOCK_B_TAIL}"
    return f"{names[0]} and {names[1]} both reached out this week. {_KNOCK_B_TAIL}"


# ---------------------------------------------------------------- the film's beats (PLAN.md §5)
# Each is chosen by a rule in code (attention.py, rants.py, routes/student.py), never written by a model.

_SUBJECT = {"her": "she", "him": "he", "them": "they"}

# FILM (needs Gurneal's OK). The drift knock on a photo of someone he has kept words for.
DRIFT_KNOCK = (
    "You haven't talked to {name} in a while, and {subject} {keeps} texting. "
    "You have un-said things for {obj}. Let {obj} know you're thinking of {obj}. Sometimes, talking is all you need."
)

# FILM (needs Gurneal's OK). On the pile of someone on WhatsApp who keeps checking in.
WAITING = "{name} is waiting to hear this from you."
# FILM (needs Gurneal's OK). The button under WAITING. Un-Said never places the call; WhatsApp does.
CALL_ACTION = "Call on {app}"

# FILM (needs Gurneal's OK). On the photo or pile of the person he has held the most for.
TAKE_THAT_STEP = (
    "Take that step. However it goes, they'll know how you feel. And there are people who love you, no matter what."
)

# FILM (needs Gurneal's OK). Home nudge when someone wrote to him elsewhere after his last letter.
REPLY_ELSEWHERE = "Reply to {name} on {app}"

APP_NAMES = {"whatsapp": "WhatsApp", "imessage": "Messages", "instagram": "Instagram"}


def drift_knock(name: str, pronoun: str) -> str:
    """'You haven't talked to Sarah in a while, and she keeps texting. ...' by name and pronoun."""
    obj = pronoun if pronoun in _SUBJECT else "them"
    subject = _SUBJECT[obj]
    return DRIFT_KNOCK.format(name=name, subject=subject, keeps="keep" if subject == "they" else "keeps", obj=obj)


def waiting(name: str) -> str:
    return WAITING.format(name=name)


def call_action(channel: str) -> str:
    return CALL_ACTION.format(app=APP_NAMES.get(channel, "WhatsApp"))


def reply_elsewhere(name: str, channel: str) -> str:
    return REPLY_ELSEWHERE.format(name=name, app=APP_NAMES.get(channel, channel))
