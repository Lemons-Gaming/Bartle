# Assembles a self-contained .tsx and index.html from the data + component parts.
import json, re, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def read(p): return open(os.path.join(ROOT, p), encoding="utf-8").read()

def strip_modules(src):
    out = []
    for line in src.splitlines():
        if re.match(r"\s*import\s.+from\s", line):   # drop import lines
            continue
        line = re.sub(r"^(\s*)export\s+default\s+", r"\1", line)
        line = re.sub(r"^(\s*)export\s+", r"\1", line)
        out.append(line)
    return "\n".join(out)

art   = strip_modules(read("art-data.js"))
logic = strip_modules(read("result-logic.js"))
qs    = strip_modules(read("questions-data.js"))
comp  = read("_build/component.jsx")
css   = read("_build/styles.css")

STYLES = "const STYLES = " + json.dumps(css) + ";\n"

DATA = "\n".join([
    "// ---- נתונים (אומנות, שאלות, לוגיקה) ----",
    art, "", logic, "", qs, "", STYLES,
])

# ----- .tsx (קומפוננטת React עצמאית) -----
tsx = (
    "import React, { useState, useEffect } from 'react';\n\n"
    + DATA + "\n"
    + "// ---- קומפוננטה ----\n"
    + comp + "\n"
    + "export default App;\n"
)
open(os.path.join(ROOT, "מודל ברטל - שאלון שחקן.tsx"), "w", encoding="utf-8").write(tsx)

# ----- index.html (עצמאי לחלוטין) -----
html = """<!doctype html>
<html dir="rtl" lang="he">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>איזה סוג שחקן אתה? · מודל ברטל</title>
<script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
<script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
<script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
<div id="root"></div>
<script type="text/babel" data-presets="react">
const { useState, useEffect } = React;

__DATA__

__COMPONENT__

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
</script>
</body>
</html>
"""
html = html.replace("__DATA__", DATA).replace("__COMPONENT__", comp)
open(os.path.join(ROOT, "index.html"), "w", encoding="utf-8").write(html)

print("wrote .tsx  ->", os.path.getsize(os.path.join(ROOT, "מודל ברטל - שאלון שחקן.tsx")), "bytes")
print("wrote index.html ->", os.path.getsize(os.path.join(ROOT, "index.html")), "bytes")
