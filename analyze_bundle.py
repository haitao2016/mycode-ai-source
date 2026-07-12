import re

with open(r'd:\xiangmuwenjian\mycode-ai-source\temp_extract\dist\renderer\assets\index-7PY44vfE.js', 'r', encoding='utf-8') as f:
    content = f.read()

print(f"Total length: {len(content)}")

patterns = ['createRoot', 'ReactDOM.render', 'render\\(', 'App\\(', 'root\\.', 'document\\.getElementById']
for pattern in patterns:
    matches = list(re.finditer(pattern, content))
    print(f"\nFound {len(matches)} occurrences of '{pattern}':")
    for i, match in enumerate(matches[:5]):
        start = max(0, match.start() - 50)
        end = min(len(content), match.end() + 50)
        print(f"  {i+1}. {content[start:end]}")

loading_pattern = re.compile(r'getElementById\([\'"]loading[\'"]\)')
loading_matches = list(loading_pattern.finditer(content))
print(f"\nFound {len(loading_matches)} loading screen references:")
for i, match in enumerate(loading_matches[:5]):
    start = max(0, match.start() - 100)
    end = min(len(content), match.end() + 100)
    print(f"  {i+1}. {content[start:end]}")