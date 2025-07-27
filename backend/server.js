import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import puppeteer from 'puppeteer';

const app = express();
const port = process.env.PORT || 3000;

// ✅ CORS – pozwalamy na połączenia z tych domen:
app.use(cors({
  origin: [
    'https://clpgenerator.brzezinski.studio',
    'https://aspolscentrapolish-f9euh4g3dsc2c5cs.polandcentral-01.azurewebsites.net',
    'https://aspol.info'
  ],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

app.use(bodyParser.json({ limit: '2mb' }));

app.post('/generate-pdf', async (req, res) => {
  const htmlContent = req.body.html;
  let browser = null;

  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    const label = await page.$('#label');
    const clip = await label?.boundingBox();

    if (!clip) throw new Error("Nie znaleziono #label w HTML!");

    const pdfBuffer = await page.pdf({
      printBackground: true,
      width: `${clip.width}px`,
      height: `${clip.height}px`,
      pageRanges: '1',
      margin: { top: 0, right: 0, bottom: 0, left: 0 }
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=etykieta.pdf');
    res.send(pdfBuffer);

  } catch (err) {
    console.error('❌ Błąd generowania PDF:', err);
    res.status(500).send('Błąd generowania PDF: ' + err.message);
  } finally {
    if (browser !== null) await browser.close();
  }
});

app.get('/', (req, res) => {
  res.send('CLP PDF Generator działa – użyj POST /generate-pdf');
});

app.listen(port, () => {
  console.log(`✅ PDF generator działa na http://localhost:${port}`);
});
