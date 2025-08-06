<<<<<<< HEAD
// pages/api/pvgis.js
import axios from 'axios';

export default async function handler(req, res) {
  const { lat, lon, puissance = 3, angle = 30, azimut = 0 } = req.query;
  if (!lat || !lon) {
    return res.status(400).json({ error: 'Missing lat/lon parameter' });
  }
  const url = `https://re.jrc.ec.europa.eu/api/v5_2/PVcalc?lat=${lat}&lon=${lon}&peakpower=${puissance}&angle=${angle}&aspect=${azimut}`;
  try {
    const response = await axios.get(url, { timeout: 15000 });
    res.status(200).json(response.data);
  } catch (e) {
    res.status(500).json({ error: e.message, status: e.response?.status });
  }
}
=======
// Simple PVGIS proxy for Next.js API route (pages/api/pvgis.js)
// Usage: /api/pvgis?url=<PVGIS_API_URL>

export default async function handler(req, res) {
  console.log('PVGIS proxy - handler called, req.url:', req.url);
  // Autorise explicitement l'origine du front React local
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  // Récupère le paramètre url de façon robuste (supporte les & dans l'URL encodée)
  let urlParam = null;
  if (req.url) {
    // Prend tout ce qui suit 'url=' jusqu'à la fin de la chaîne, sans jamais couper
    const idx = req.url.indexOf('url=');
    if (idx !== -1) {
      urlParam = decodeURIComponent(req.url.slice(idx + 4));
    }
  }
  if (!urlParam) {
    return res.status(400).json({ error: 'Missing PVGIS url parameter' });
  }
  // DEBUG: log la valeur reçue
  console.log('PVGIS proxy - urlParam FINAL:', urlParam);
  try {
    const fetchRes = await fetch(urlParam, {
      headers: {
        'User-Agent': 'PVGIS-Proxy-Next',
        'Accept': 'application/json',
      },
    });
    if (!fetchRes.ok) {
      return res.status(fetchRes.status).json({ error: 'PVGIS API error', status: fetchRes.status });
    }
    let data, isJson = true;
    try {
      data = await fetchRes.json();
    } catch (err) {
      isJson = false;
      data = await fetchRes.text();
    }
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    if (isJson) {
      return res.status(200).json(data);
    } else {
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      return res.status(200).send(data);
    }
  } catch (e) {
    // Log complet de l'erreur pour debug Vercel
    console.error('PVGIS proxy error:', e);
    return res.status(500).json({ error: 'Proxy error', details: e.message, stack: e.stack, full: e });
  }
}
>>>>>>> 1b7215a (feat: proxy PVGIS Next.js prêt pour Vercel)
