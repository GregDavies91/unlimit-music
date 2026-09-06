import os
A = "/workspaces/hermes/greg/projects/unlimit-chords/unlimitchords/Assets/Resources"
audio = set(f[:-4] for f in os.listdir(os.path.join(A, "Audio")) if f.endswith(".mp3"))
diag = set(f[:-4] for f in os.listdir(os.path.join(A, "Sprites"))
           if f.endswith(".png") and not f.lower().startswith("button")
           and "unlimitlogo" not in f.lower())
exact = audio & diag
norm = set(a.replace("Maj", "M") for a in audio) & diag
print("audio:", len(audio), "diagrams:", len(diag))
print("exact matches:", len(exact))
print("extra via Maj->M fallback:", len(norm - exact))
missing = audio - diag - set(a.replace("Maj", "M") for a in audio)
print("truly missing diagram:", len(missing))
print("missing samples:", sorted(missing)[:80])
