import re

with open(r'd:\xiangmuwenjian\mycode-ai-source\temp_extract\dist\renderer\assets\index-7PY44vfE.js', 'r', encoding='utf-8') as f:
    content = f.read()

map_deps_match = re.search(r'const __vite__mapDeps=\(i,m=__vite__mapDeps,d=\(m\.f\|\|\(m\.f=\[([^\]]+)\]', content)
if map_deps_match:
    deps = map_deps_match.group(1)
    dep_list = re.findall(r'\"([^\"]+)\"', deps)
    print(f"Total dependencies: {len(dep_list)}")
    print("\nFirst 20 dependencies:")
    for i, dep in enumerate(dep_list[:20]):
        print(f"  {i+1}. {dep}")
    
    print("\nLast 20 dependencies:")
    for i, dep in enumerate(dep_list[-20:]):
        print(f"  {i+1}. {dep}")

import_pattern = re.compile(r'import\s*\{[^}]+\}\s*from\s*["\']([^"\']+)["\']')
imports = list(import_pattern.finditer(content))
print(f"\nFound {len(imports)} import statements")
for i, imp in enumerate(imports[:10]):
    print(f"  {i+1}. {imp.group(0)}")