import subprocess
result = subprocess.run(['tasklist'], capture_output=True, text=True)
for line in result.stdout.split('\n'):
    if 'MyCode' in line:
        print(line)