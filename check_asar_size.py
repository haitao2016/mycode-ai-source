import os

paths = [
    r'd:\xiangmuwenjian\mycode-ai-source\release\win-unpacked-fixed\resources\app.asar',
    r'd:\xiangmuwenjian\mycode-ai-source\release\win-unpacked\resources\app.asar'
]

for p in paths:
    if os.path.exists(p):
        size = os.path.getsize(p)
        print(f'{p}: {size} bytes')
    else:
        print(f'{p}: NOT FOUND')