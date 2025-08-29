import os
import json

# Check what files exist in the current directory
current_dir = os.path.dirname(os.path.abspath(__file__))

def scan_directory(directory):
    structure = {}
    try:
        for root, dirs, files in os.walk(directory):
            # Get relative path from src
            rel_root = os.path.relpath(root, directory)
            if rel_root == '.':
                rel_root = 'root'
            
            structure[rel_root] = {
                'directories': dirs,
                'files': files
            }
    except Exception as e:
        print(f"Error scanning directory: {e}")
    
    return structure

# Scan and display structure
file_structure = scan_directory(current_dir)
print(json.dumps(file_structure, indent=2))

# Check for specific important files
important_files = [
    'App.js', 'App.jsx', 'App.ts', 'App.tsx',
    'index.js', 'index.jsx', 'index.ts', 'index.tsx',
    'package.json', 'App.css', 'index.css'
]

print("\nChecking for important files:")
for filename in important_files:
    filepath = os.path.join(current_dir, filename)
    if os.path.exists(filepath):
        print(f"✓ Found: {filename}")
        # Try to read first few lines
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                lines = f.readlines()[:10]
                print(f"  First few lines: {len(lines)} lines")
                for i, line in enumerate(lines):
                    print(f"    {i+1}: {line.rstrip()}")
        except Exception as e:
            print(f"  Error reading {filename}: {e}")
    else:
        print(f"✗ Not found: {filename}")

print(f"\nTotal files in structure: {sum(len(info['files']) for info in file_structure.values())}")