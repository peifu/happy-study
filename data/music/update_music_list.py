#!/usr/bin/env python3
"""Generate or refresh data/music/playlist/music-list.json from the song files.

Run from the repo root:
    python data/music/update_music_list.py

You can also specify custom source and output paths:
    python data/music/update_music_list.py --songs-dir data/music/songs --output data/music/playlist/music-list.json
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import List, Dict, Tuple

VALID_EXTENSIONS = {'.mp3', '.ogg'}


def parse_song_filename(filename: str) -> Tuple[str, str]:
    """Parse a song filename into title and artist.

    Expected format is artist-title.ext. If the dash is missing, the whole name is treated as title.
    """
    if '-' in filename:
        artist, title = filename.split('-', 1)
    else:
        artist, title = '', filename
    return title.strip(), artist.strip()


def collect_songs(songs_dir: Path) -> List[Dict[str, str]]:
    """Collect song metadata from the songs directory."""
    songs: List[Dict[str, str]] = []
    for path in sorted(songs_dir.iterdir(), key=lambda p: p.name.lower()):
        if not path.is_file():
            continue
        if path.suffix.lower() not in VALID_EXTENSIONS:
            continue
        title, artist = parse_song_filename(path.stem)
        songs.append({
            'title': title,
            'artist': artist,
        })
    return songs


def write_json_file(output_path: Path, songs: List[Dict[str, str]]) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with output_path.open('w', encoding='utf-8') as f:
        json.dump(songs, f, ensure_ascii=False, indent=2)
        f.write('\n')


def main() -> int:
    parser = argparse.ArgumentParser(description='Update data/music/playlist/music-list.json from the song files.')
    parser.add_argument('--songs-dir', type=Path, default=Path(__file__).resolve().parent / 'songs', help='Directory containing song files.')
    parser.add_argument('--output', type=Path, default=Path(__file__).resolve().parent / 'playlist' / 'music-list.json', help='Output playlist JSON file.')
    parser.add_argument('--sort', action='store_true', help='Sort songs by artist then title.')
    parser.add_argument('--backup', action='store_true', help='Create a backup copy of the existing output file before overwriting.')
    args = parser.parse_args()

    songs_dir = args.songs_dir
    output_path = args.output

    if not songs_dir.exists() or not songs_dir.is_dir():
        print(f'Error: songs directory not found: {songs_dir}', file=sys.stderr)
        return 1

    songs = collect_songs(songs_dir)
    if args.sort:
        songs = sorted(songs, key=lambda song: (song['artist'], song['title']))

    if args.backup and output_path.exists():
        backup_path = output_path.with_suffix(output_path.suffix + '.bak')
        output_path.replace(backup_path)
        print(f'Backed up existing file to: {backup_path}')

    write_json_file(output_path, songs)
    print(f'Updated {output_path} with {len(songs)} songs from {songs_dir}')
    return 0


if __name__ == '__main__':
    import sys
    raise SystemExit(main())
