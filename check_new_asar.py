import subprocess

result = subprocess.run(['asar', 'list', r'd:\xiangmuwenjian\mycode-ai-source\temp_extract\app_new.asar'], capture_output=True, text=True)
print("Files in new asar:")
print(result.stdout[:5000])
if result.stderr:
    print("Errors:", result.stderr)