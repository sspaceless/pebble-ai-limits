Provider marks come from official product assets:

- `codex-mark.svg`, `gemini-mark.svg`, `claude-mark.svg`, and `custom-mark.svg` are the canonical scalable sources for phone settings. `npm run generate:icons` copies their SVG content into the PebbleKit JS bundle module at `src/pkjs/provider-icons.js`; edit the SVGs, then regenerate the module.
- Gemini sparkle geometry was extracted from the SVG served by the official Gemini web app; the original download is retained as `gemini-official-source.svg`.
- Claude's orange mark uses the official mark contour in the inline Claude wordmark at https://claude.com/.
- `codex-mark.svg` is a small-size vector adaptation of the Codex app icon shown in OpenAI's [Codex app announcement](https://openai.com/index/introducing-the-codex-app/).
- `openai-knot.svg` is retained as the source for an earlier monochrome watch mark; it is no longer bundled. The watch now draws the Codex cloud-terminal mark in `src/c/main.c`, using a blue-violet vertical palette on color displays and black on monochrome displays.

These marks identify connected providers and do not imply endorsement.
