import os

dir_path = r'd:\xiangmuwenjian\mycode-ai-source\temp_extract\dist\renderer\assets'
files = os.listdir(dir_path)
print(f'Total files: {len(files)}')

needed = [
    'index-7PY44vfE.js',
    'rolldown-runtime-BucNuzZI.js',
    'icons-Bk6cCsDN.js',
    'react-D2Lk08tL.js',
    'zustand-CNzM5W90.js',
    'eventBus-NbQnnMRF.js',
    'monaco-CXwDOUz8.js',
    'monaco-CWI9TnMM.css',
    'index-nVV1V-Eg.css'
]

for f in needed:
    status = "FOUND" if f in files else "MISSING"
    print(f'{f}: {status}')