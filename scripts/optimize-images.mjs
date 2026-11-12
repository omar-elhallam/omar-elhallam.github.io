// Converts the raw screenshots in /assets-src into small WebP variants in src/assets/img.
// Run once after adding an image:  npm run images
import sharp from 'sharp'
import { readdir } from 'node:fs/promises'
import { join, parse } from 'node:path'

const SRC = 'assets-src', OUT = 'src/assets/img', WIDTHS = [480, 960]
for (const file of await readdir(SRC)) {
  if (!/\.(png|jpe?g)$/i.test(file)) continue
  const { name } = parse(file)
  for (const w of WIDTHS) {
    const out = join(OUT, `${name}-${w}.webp`)
    const info = await sharp(join(SRC, file))
      .resize({ width: w, withoutEnlargement: true })
      .flatten({ background: '#FAF8F4' })   // transparent PNGs sit on ivory, not black
      .webp({ quality: 72, effort: 6 })
      .toFile(out)
    console.log(out.padEnd(40), (info.size / 1024).toFixed(1) + ' KB')
  }
}
