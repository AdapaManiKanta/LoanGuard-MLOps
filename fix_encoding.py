"""
Reverses PowerShell double-encoding: UTF-8 file read as cp1252, saved as UTF-8.
Fix: encode each garbled char back as cp1252 bytes, then decode as UTF-8.
"""

path = r"C:\ManiKanta\coding\LoanGuard-MLOps\frontend\src\App.js"

with open(path, "r", encoding="utf-8") as f:
    content = f.read()

def fix_mojibake(text):
    result = []
    i = 0
    while i < len(text):
        c = text[i]
        if ord(c) < 0x80:
            result.append(c)
            i += 1
        else:
            # Collect a run of non-ASCII chars and try cp1252 -> UTF-8
            j = i
            while j < len(text) and ord(text[j]) >= 0x80:
                j += 1
            segment = text[i:j]
            try:
                raw = segment.encode('cp1252')
                decoded = raw.decode('utf-8')
                result.append(decoded)
            except (UnicodeEncodeError, UnicodeDecodeError):
                # Try char by char
                for ch in segment:
                    try:
                        b = ch.encode('cp1252')
                        result.append(b.decode('latin-1'))
                    except Exception:
                        result.append(ch)
            i = j
    return ''.join(result)

fixed = fix_mojibake(content)

with open(path, "w", encoding="utf-8") as f:
    f.write(fixed)

# Verify some key characters
checks = [
    ('Clipboard emoji', '\U0001f4cb', '📋'),
    ('Rupee', '\u20b9', '₹'),
    ('Em dash', '\u2014', '—'),
    ('Lightning', '\u26a1', '⚡'),
    ('Bar chart', '\U0001f4ca', '📊'),
    ('Folder', '\U0001f4c2', '📂'),
    ('Gear', '\u2699', '⚙'),
    ('Magnify', '\U0001f50d', '🔍'),
]
print("Verification:")
for name, char, _ in checks:
    print(f"  {name}: {'FOUND' if char in fixed else 'MISSING'}")

print("\nDone! File fixed.")
