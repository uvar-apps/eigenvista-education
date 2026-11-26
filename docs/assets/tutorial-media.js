async function addTutorialChapters(video) {
  const chapterTrack = video.querySelector('track[kind="chapters"]');
  if (!chapterTrack) return;

  const response = await fetch(chapterTrack.src);
  if (!response.ok) return;
  const text = await response.text();
  const cues = [...text.matchAll(/(\d\d):(\d\d):(\d\d\.\d+) --> [^\n]+\n([^\n]+)/g)];
  if (!cues.length) return;

  const chapters = document.createElement('div');
  chapters.className = 'tutorial-chapters';
  chapters.setAttribute('role', 'group');
  chapters.setAttribute('aria-label', 'Video chapters');
  for (const [, hours, minutes, seconds, label] of cues) {
    const start = Number(hours) * 3600 + Number(minutes) * 60 + Number(seconds);
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = label.replace(/&(amp|lt|gt);/g, (_, entity) => ({ amp: '&', lt: '<', gt: '>' })[entity]);
    button.addEventListener('click', () => {
      video.currentTime = start;
      video.play().catch(() => {
        // The built-in Play control remains available when playback is blocked.
      });
    });
    chapters.append(button);
  }
  video.after(chapters);
}

for (const video of document.querySelectorAll('.tutorial-media video')) {
  addTutorialChapters(video).catch(() => {
    // A failed chapter download should leave native playback available.
  });
}
