// XML/HTML SINTÉTICOS escritos para o teste; não são respostas reais de nenhum veículo.
import test from 'node:test'
import assert from 'node:assert/strict'
import { parseFeed, discoverFeeds, robotsAllows } from './feeds.ts'

test('parseFeed lê RSS 2.0 e limita o trecho a 200 caracteres sem HTML', () => {
  const xml = `<?xml version="1.0"?><rss version="2.0"><channel><item><title>Obra X</title><link>https://ex.com/a</link><pubDate>Mon, 26 Oct 2026 10:00:00 GMT</pubDate><description><![CDATA[<p>${'palavra '.repeat(60)}</p>]]></description></item></channel></rss>`
  const [i] = parseFeed(xml)
  assert.equal(i.title, 'Obra X')
  assert.equal(i.link, 'https://ex.com/a')
  assert.equal(i.published_at, '2026-10-26T10:00:00.000Z')
  assert.ok((i.snippet ?? '').length <= 200 && !i.snippet?.includes('<'))
})

test('parseFeed lê Atom e ignora entradas sem link', () => {
  const xml = `<feed xmlns="http://www.w3.org/2005/Atom"><entry><title>Ponte</title><link rel="alternate" href="https://ex.com/p"/><updated>2026-10-25T08:00:00Z</updated></entry><entry><title>Sem link</title></entry></feed>`
  const items = parseFeed(xml)
  assert.equal(items.length, 1)
  assert.equal(items[0].link, 'https://ex.com/p')
})

test('discoverFeeds acha rel=alternate e absolutiza', () => {
  const html = `<head><link rel="alternate" type="application/rss+xml" href="/feed"><link rel="stylesheet" href="/a.css"></head>`
  assert.deepEqual(discoverFeeds(html, 'https://ex.com/x'), ['https://ex.com/feed'])
})

test('robotsAllows respeita Disallow e Allow mais específico', () => {
  const r = 'User-agent: *\nDisallow: /privado\nAllow: /privado/publico\n'
  assert.equal(robotsAllows(r, '/feed'), true)
  assert.equal(robotsAllows(r, '/privado/x'), false)
  assert.equal(robotsAllows(r, '/privado/publico/y'), true)
  assert.equal(robotsAllows('User-agent: *\nDisallow: /', '/feed'), false)
  assert.equal(robotsAllows('', '/feed'), true)
})

test('parseFeed devolve vazio para HTML e XML inválido, sem lançar', () => {
  assert.deepEqual(parseFeed('<!doctype html><html><body>' + '<div>'.repeat(500) + '</body></html>'), [])
  assert.deepEqual(parseFeed('<rss><channel><item><title>x</item>'), [])
  assert.deepEqual(parseFeed(''), [])
})

test('robotsAllows trata curingas: regra /*?s= não bloqueia o site todo', () => {
  const r = 'User-agent: *\nDisallow: /*?s=\nDisallow: /wp-admin/\nDisallow: /*.pdf$\nAllow: /wp-admin/admin-ajax.php\n'
  assert.equal(robotsAllows(r, '/'), true)
  assert.equal(robotsAllows(r, '/feed/'), true)
  assert.equal(robotsAllows(r, '/busca?s=obra'), false)
  assert.equal(robotsAllows(r, '/docs/a.pdf'), false)
  assert.equal(robotsAllows(r, '/docs/a.pdf?x=1'), true)
  assert.equal(robotsAllows(r, '/wp-admin/x'), false)
  assert.equal(robotsAllows(r, '/wp-admin/admin-ajax.php'), true)
})
