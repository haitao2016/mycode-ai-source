import os
import json

def fix_binding_gyp(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8-sig') as f:
            content = f.read()
        
        content = content.replace('SpectreMitigation": "Spectre"', 'SpectreMitigation": "none"')
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"Fixed: {filepath}")
    except Exception as e:
        print(f"Error fixing {filepath}: {e}")

root = r'd:\xiangmuwenjian\mycode-ai-source\code-oss\node_modules'

for dirpath, dirnames, filenames in os.walk(root):
    for filename in filenames:
        if filename == 'binding.gyp':
            full_path = os.path.join(dirpath, filename)
            try:
                with open(full_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    if 'SpectreMitigation' in content:
                        fix_binding_gyp(full_path)
            except:
                pass

print("Done!")