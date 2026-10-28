// Respostas SINTÉTICAS do Commons, inventadas para o teste.
import test from 'node:test'
import assert from 'node:assert/strict'
import { pickPhotos, photoQueries } from './photos.ts'

const page = (title: string, lic: string, w = 2000, h = 1200, mime = 'image/jpeg', desc = '') => ({
  title, imageinfo: [{ thumburl: 'https://upload.example/x.jpg', url: 'https://upload.example/o.jpg', width: w, height: h, mime, descriptionurl: 'https://commons.example/File:x', extmetadata: { LicenseShortName: { value: lic }, ImageDescription: { value: desc }, Artist: { value: '<a>Autor</a>' } } }],
})

test('pickPhotos aceita CC0/domínio público e rejeita CC BY, vertical, pequena e com pessoas/logos', () => {
  const ok = pickPhotos([
    page('File:Bridge construction.jpg', 'CC0'),
    page('File:Plant.jpg', 'Public domain'),
    page('File:Plant by.jpg', 'CC BY-SA 4.0'),
    page('File:Vertical.jpg', 'CC0', 1000, 1600),
    page('File:Small.jpg', 'CC0', 600, 400),
    page('File:Workers on site.jpg', 'CC0'),
    page('File:Company logo.jpg', 'CC0'),
    page('File:Diagram.png', 'CC0', 2000, 1200, 'image/png'),
    page('File:Sewage plant (Journal, 1899).jpg', 'Public domain'),
    page('File:Plant engraving.jpg', 'CC0'),
  ])
  assert.deepEqual(ok.map((p) => p.license), ['CC0', 'Public domain'])
  assert.equal(ok[0].credit, 'Autor')
})

test('photoQueries põe a consulta da matéria primeiro e usa o tema', () => {
  const q = photoQueries('Saneamento', 'landfill aerial view')
  assert.equal(q[0], 'landfill aerial view')
  assert.ok(q.includes('sewage treatment plant'))
  assert.ok(photoQueries('Algo novo').includes('construction site'))
})
