"""Assemble the static site, preserving the original long MP4 files byte for byte."""
from pathlib import Path
import hashlib, json, shutil

root=Path(__file__).resolve().parents[2]
site=root/'_site'
site.mkdir(exist_ok=True)
for item in root.iterdir():
    if item.name in {'.git','.github','_media','_site'}:
        continue
    if item.is_dir():
        shutil.copytree(item,site/item.name,dirs_exist_ok=True)
    else:
        shutil.copy2(item,site/item.name)
for movie in json.loads((root/'_media'/'manifest.json').read_text()):
    target=site/movie['target']
    target.parent.mkdir(parents=True,exist_ok=True)
    digest=hashlib.sha256()
    with target.open('wb') as output:
        for relative in movie['parts']:
            with (root/relative).open('rb') as stream:
                while block:=stream.read(1024*1024):
                    output.write(block)
                    digest.update(block)
    assert target.stat().st_size==movie['bytes'],movie['target']
    assert digest.hexdigest()==movie['sha256'],movie['target']
    print('Verified original video:',movie['target'])
print('Static site ready:',sum(p.stat().st_size for p in site.rglob('*') if p.is_file()),'bytes')
