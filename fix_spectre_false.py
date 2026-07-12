import os

root = r'd:\xiangmuwenjian\mycode-ai-source\code-oss\node_modules'

for dirpath, dirnames, filenames in os.walk(root):
    for filename in filenames:
        if filename == 'binding.gyp':
            full_path = os.path.join(dirpath, filename)
            try:
                with open(full_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                if 'SpectreMitigation' in content:
                    content = content.replace('SpectreMitigation": "Spectre"', 'SpectreMitigation": "false"')
                    content = content.replace('SpectreMitigation": "none"', 'SpectreMitigation": "false"')
                    
                    with open(full_path, 'w', encoding='utf-8') as f:
                        f.write(content)
                    print(f"Fixed: {full_path}")
            except Exception as e:
                print(f"Error: {full_path} - {e}")

print("Done!")