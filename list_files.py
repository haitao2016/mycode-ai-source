import os

path = r'd:\xiangmuwenjian\mycode-ai-source\release\win-unpacked-fixed\resources'
for f in os.listdir(path):
    if 'asar' in f.lower():
        print(f)