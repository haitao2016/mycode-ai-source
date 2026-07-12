import os
import subprocess

def run_command(cmd):
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    return result.stdout, result.stderr

modules = [
    '@vscode/native-watchdog',
    '@vscode/policy-watcher',
    '@vscode/spdlog',
    '@vscode/sqlite3',
    '@vscode/windows-ca-certs',
    '@vscode/windows-mutex',
    '@vscode/windows-process-tree',
    '@vscode/windows-registry',
    '@parcel/watcher',
    'kerberos',
    'native-is-elevated',
    'native-keymap',
    'node-pty',
    'utf-8-validate',
    'windows-foreground-love',
    'bufferutil'
]

root = r'd:\xiangmuwenjian\mycode-ai-source\code-oss\node_modules'

for module in modules:
    path = os.path.join(root, module, 'binding.gyp')
    if os.path.exists(path):
        with open(path, 'rb') as f:
            content = f.read()
        
        if content.startswith(b'\xef\xbb\xbf'):
            content = content[3:]
        
        try:
            content_str = content.decode('utf-8')
            if 'SpectreMitigation' in content_str:
                content_str = content_str.replace('SpectreMitigation": "Spectre"', 'SpectreMitigation": "none"')
            
            with open(path, 'wb') as f:
                f.write(content_str.encode('utf-8'))
            print(f"Fixed: {module}")
        except:
            print(f"Reinstalling: {module}")
            subprocess.run(f"cd {root}\\.. && npm uninstall {module}", shell=True)
            subprocess.run(f"cd {root}\\.. && npm install {module}", shell=True)

print("Done!")