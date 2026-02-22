import re

path = r"C:\ManiKanta\coding\LoanGuard-MLOps\frontend\src\App.js"

with open(path, "rb") as f:
    raw = f.read()

# Fix remaining garbled emojis by direct byte replacement
# These have undefined cp1252 bytes so need byte-level fix

replacements = [
    # 🔍 (U+1F50D) = F0 9F 90 8D → garbled when 0x90, 0x8D undefined in cp1252
    # The garbled form in the file has replacement chars for undefined bytes
    # Instead, just scan for the text patterns and replace the whole icon
    # We'll do string-level replacements after reading as UTF-8
]

with open(path, "r", encoding="utf-8", errors="replace") as f:
    content = f.read()

# Fix any remaining garbled sequences before known text
fixes = [
    # Header buttons - replace garbled icon + known text
    (r'[^\x00-\x7F\u2014\u20b9\u26a1\u2699\ufe0f\U0001F4CB\U0001F4CA\U0001F4C2\U0001F50D\U0001F4F2\U0001F4C4\U0001F3E6]+Eligibility', '\U0001F50D Eligibility'),
    (r'[^\x00-\x7F\u2014\u20b9\u26a1\u2699\ufe0f\U0001F4CB\U0001F4CA\U0001F4C2\U0001F50D\U0001F4F2\U0001F4C4\U0001F3E6]+Install', '\U0001F4F2 Install'),
]

for pattern, replacement in fixes:
    content = re.sub(pattern, replacement, content)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("Done - header button icons fixed")
