"""Generate original German speech files. Install edge-tts and mutagen first.
Set PYTHONPATH to the task-local install when using --target. No Goethe audio is copied.
"""
import asyncio, json, hashlib, math
from pathlib import Path
import edge_tts
from mutagen.mp3 import MP3
import miniaudio

ROOT=Path(__file__).resolve().parents[1]
async def main():
    manifest=json.loads((ROOT/'scripts/audio-manifest.json').read_text(encoding='utf-8'))
    destination=ROOT/'public/audio'
    destination.mkdir(parents=True,exist_ok=True)
    report=[]
    previous_path=destination/'manifest.json'
    previous={x['id']:x for x in json.loads(previous_path.read_text(encoding='utf-8'))} if previous_path.exists() else {}
    for i,item in enumerate(manifest):
        output=destination/f"{item['id']}.mp3"
        digest=hashlib.sha256(json.dumps({'text':item['text'],'segments':item.get('segments')},ensure_ascii=False,sort_keys=True).encode()).hexdigest()
        old=previous.get(item['id'],{})
        unchanged=old.get('sha256')==digest or (not item.get('segments') and old.get('text')==item['text'])
        if not output.exists() or output.stat().st_size<1000 or not unchanged:
            for retry in range(3):
                try:
                    if item.get('segments'):
                        cache=ROOT.parent/'.local-tools/audio-fragments'
                        cache.mkdir(parents=True,exist_ok=True)
                        chunks=[]
                        for n,segment in enumerate(item['segments']):
                            fragment=cache/f"{item['id']}-{n}.mp3"
                            await edge_tts.Communicate(segment['text'],voice=segment['voice'],rate='-3%').save(str(fragment))
                            chunks.append(fragment.read_bytes())
                        output.write_bytes(b''.join(chunks))
                    else:
                        await edge_tts.Communicate(item['text'],voice='de-DE-KatjaNeural' if i%2==0 else 'de-DE-ConradNeural',rate='-3%').save(str(output))
                    break
                except Exception:
                    if retry==2: raise
        audio=MP3(output)
        assert audio.info.length>1 and audio.info.sample_rate>=16000
        decoded=miniaudio.decode_file(str(output),nchannels=1,sample_rate=16000)
        samples=decoded.samples
        peak=max(abs(v) for v in samples)/32768
        rms=math.sqrt(sum(v*v for v in samples)/len(samples))/32768
        assert peak>.01 and rms>.001, f"Silent or invalid audio: {item['id']}"
        report.append({'id':item['id'],'seconds':round(len(samples)/16000,2),'bytes':output.stat().st_size,'voice':'synthetic German speech','sha256':digest,'rms':round(rms,6),'peak':round(peak,6),'decoded':True})
        print(f"{i+1}/{len(manifest)} {item['id']}: {audio.info.length:.1f}s",flush=True)
    (ROOT/'public/audio/manifest.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
asyncio.run(main())
