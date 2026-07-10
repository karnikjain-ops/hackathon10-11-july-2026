import os
import re

src_dir = r"c:\Users\KARNIK\OneDrive\Desktop\healthcare\frontend\src"

for root, _, files in os.walk(src_dir):
    for file in files:
        if file.endswith(".jsx") or file.endswith(".js"):
            file_path = os.path.join(root, file)
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()

            # Find all variations of the URL
            # Matches 'http://127.0.0.1:8000/path' and replaces with `${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'}/path`
            # Need to convert quotes to backticks if they aren't already
            
            def replacer(match):
                url_path = match.group(1)
                return f"`${{import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'}}{url_path}`"

            # Match single quotes
            new_content = re.sub(r"'http://127\.0\.0\.1:8000(.*?)'", replacer, content)
            # Match double quotes
            new_content = re.sub(r'"http://127\.0\.0\.1:8000(.*?)"', replacer, new_content)
            # Match backticks (if any)
            new_content = re.sub(r"`http://127\.0\.0\.1:8000(.*?)`", replacer, new_content)

            if new_content != content:
                with open(file_path, "w", encoding="utf-8") as f:
                    f.write(new_content)
                print(f"Updated {file_path}")
