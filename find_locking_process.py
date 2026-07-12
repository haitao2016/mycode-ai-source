import subprocess

try:
    result = subprocess.run(['powershell', '-Command', 'Get-Process | ForEach-Object { $name = $_.Name; $id = $_.Id; try { $_.Modules | ForEach-Object { if ($_.FileName -like "*app.asar*") { Write-Output "$name ($id)" } } } catch { } }'], capture_output=True, text=True)
    print("Processes accessing app.asar:")
    print(result.stdout)
    if result.stderr:
        print("Errors:", result.stderr)
except Exception as e:
    print(f"Error: {e}")