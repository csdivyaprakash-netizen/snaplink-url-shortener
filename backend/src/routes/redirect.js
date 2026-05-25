const express = require('express');
const router = express.Router();
const Url = require('../models/Url');
const Visit = require('../models/Visit');

// GET /:shortCode — redirect with analytics logging
router.get('/:shortCode', async (req, res, next) => {
  try {
    const { shortCode } = req.params;
    const url = await Url.findOne({ shortCode });

    if (!url) {
      return res.redirect(`${process.env.CLIENT_URL}/not-found`);
    }

    // Check expiry
    if (url.expiresAt && new Date() > new Date(url.expiresAt)) {
      return res.redirect(`${process.env.CLIENT_URL}/expired`);
    }

    // Get IP
    const ip =
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      req.socket?.remoteAddress ||
      'unknown';

    const userAgent = req.headers['user-agent'] || 'unknown';

    // Log visit asynchronously (don't block redirect)
    const visit = new Visit({ urlId: url._id, ip, userAgent });

    // Try geolocation lookup
    try {
      const geo = await fetch(`http://ip-api.com/json/${ip}?fields=country,city,status`);
      const geoData = await geo.json();
      if (geoData.status === 'success') {
        visit.country = geoData.country;
        visit.city = geoData.city;
      }
    } catch {
      // Geolocation is best-effort, ignore errors
    }

    await visit.save();

    // Update click count and last visited
    await Url.updateOne(
      { _id: url._id },
      { $inc: { clickCount: 1 }, $set: { lastVisitedAt: new Date() } }
    );

    res.redirect(302, url.originalUrl);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
