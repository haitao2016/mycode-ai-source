import re

with open(r'd:\xiangmuwenjian\mycode-ai-source\temp_extract\dist\renderer\assets\index-7PY44vfE.js', 'r', encoding='utf-8') as f:
    content = f.read()

error_patterns = ['try\\s*\\{', 'catch\\s*\\(', 'onerror', 'addEventListener.*error', 'console\\.error', 'throw']
for pattern in error_patterns:
    matches = list(re.finditer(pattern, content))
    print(f"\nFound {len(matches)} occurrences of '{pattern}':")
    for i, match in enumerate(matches[:5]):
        start = max(0, match.start() - 30)
        end = min(len(content), match.end() + 30)
        print(f"  {i+1}. {content[start:end]}")

window_api_pattern = re.compile(r'window\.api')
api_matches = list(window_api_pattern.finditer(content))
print(f"\nFound {len(api_matches)} window.api references:")
for i, match in enumerate(api_matches[:10]):
    start = max(0, match.start() - 30)
    end = min(len(content), match.end() + 30)
    print(f"  {i+1}. {content[start:end]}")

init_pattern = re.compile(r'(init|bootstrap|start|main)\s*\(')
init_matches = list(init_pattern.finditer(content))
print(f"\nFound {len(init_matches)} initialization function calls:")
for i, match in enumerate(init_matches[:10]):
    start = max(0, match.start() - 30)
    end = min(len(content), match.end() + 30)
    print(f"  {i+1}. {content[start:end]}")