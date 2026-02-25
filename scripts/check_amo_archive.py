#!/usr/bin/env python3
import struct
import sys
import zipfile

REQUIRED = {
    'images/logo.png': (130, 100),
    'images/logo_small.png': (108, 108),
    'images/logo_medium.png': (240, 84),
    'images/logo_min.png': (84, 84),
}

if len(sys.argv) != 2:
    print('Usage: python scripts/check_amo_archive.py <path-to-zip>')
    sys.exit(2)

zip_path = sys.argv[1]

with zipfile.ZipFile(zip_path) as zf:
    names = set(zf.namelist())

    bad_entries = [n for n in names if '__MACOSX/' in n or n.endswith('.DS_Store') or '/.DS_Store' in n]
    if bad_entries:
        print('FAIL: archive contains forbidden metadata files (macOS artifacts):')
        for n in sorted(bad_entries):
            print(' -', n)
        sys.exit(1)

    for file_name, expected_size in REQUIRED.items():
        if file_name not in names:
            print(f'FAIL: missing required logo file: {file_name}')
            sys.exit(1)

        raw = zf.read(file_name)
        if raw[:8] != b'\x89PNG\r\n\x1a\n':
            print(f'FAIL: {file_name} is not a PNG file')
            sys.exit(1)

        if raw[12:16] != b'IHDR':
            print(f'FAIL: {file_name} does not have a valid IHDR chunk')
            sys.exit(1)

        width, height = struct.unpack('>II', raw[16:24])
        if (width, height) != expected_size:
            print(f'FAIL: {file_name} has size {width}x{height}, expected {expected_size[0]}x{expected_size[1]}')
            sys.exit(1)

print('OK: archive logo assets and metadata checks passed')
