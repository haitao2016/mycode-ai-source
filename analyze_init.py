with open(r'd:\xiangmuwenjian\mycode-ai-source\temp_extract\dist\renderer\assets\index-7PY44vfE.js', 'r', encoding='utf-8') as f:
    content = f.read()

first_1000 = content[:1000]
print("First 1000 characters:")
print(first_1000)
print("\n" + "="*50 + "\n")

window_api_index = content.find('window.api')
if window_api_index >= 0:
    print(f"window.api found at index {window_api_index}")
    print("Context around window.api:")
    print(content[window_api_index-200:window_api_index+200])