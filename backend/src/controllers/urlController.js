const { nanoid } = require('nanoid');
const validator = require('validator');
const Url = require('../models/Url');
const Visit = require('../models/Visit');

// POST /api/urls
const createUrl = async (req, res, next) => {
  try {
    const { originalUrl, alias, expiresAt } = req.body;

    if (!originalUrl) {
      return res.status(400).json({ message: 'Original URL is required' });
    }
    if (!validator.isURL(originalUrl, { require_protocol: true })) {
      return res.status(400).json({ message: 'Please provide a valid URL (include http:// or https://)' });
    }

    let shortCode = alias ? alias.trim() : nanoid(7);

    // Validate alias format
    if (alias) {
      if (!/^[a-zA-Z0-9_-]+$/.test(alias)) {
        return res.status(400).json({ message: 'Alias can only contain letters, numbers, hyphens, and underscores' });
      }
      const existing = await Url.findOne({ shortCode: alias });
      if (existing) {
        return res.status(409).json({ message: 'This alias is already taken' });
      }
    } else {
      // Ensure uniqueness for auto-generated codes
      let attempts = 0;
      while (await Url.findOne({ shortCode })) {
        shortCode = nanoid(7);
        attempts++;
        if (attempts > 10) return res.status(500).json({ message: 'Could not generate unique code' });
      }
    }

    const url = await Url.create({
      userId: req.user._id,
      originalUrl,
      shortCode,
      alias: alias || null,
      expiresAt: expiresAt || null,
    });

    res.status(201).json({
      ...url.toObject(),
      shortUrl: `${process.env.BASE_URL}/${shortCode}`,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/urls
const getUserUrls = async (req, res, next) => {
  try {
    const urls = await Url.find({ userId: req.user._id }).sort({ createdAt: -1 });
    const result = urls.map((u) => ({
      ...u.toObject(),
      shortUrl: `${process.env.BASE_URL}/${u.shortCode}`,
    }));
    res.json(result);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/urls/:id
const deleteUrl = async (req, res, next) => {
  try {
    const url = await Url.findOne({ _id: req.params.id, userId: req.user._id });
    if (!url) {
      return res.status(404).json({ message: 'URL not found' });
    }
    await Url.deleteOne({ _id: url._id });
    await Visit.deleteMany({ urlId: url._id });
    res.json({ message: 'URL deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/urls/:id
const updateUrl = async (req, res, next) => {
  try {
    const { originalUrl, expiresAt } = req.body;
    const url = await Url.findOne({ _id: req.params.id, userId: req.user._id });
    if (!url) {
      return res.status(404).json({ message: 'URL not found' });
    }

    if (originalUrl) {
      if (!validator.isURL(originalUrl, { require_protocol: true })) {
        return res.status(400).json({ message: 'Please provide a valid URL' });
      }
      url.originalUrl = originalUrl;
    }
    if (expiresAt !== undefined) url.expiresAt = expiresAt;

    await url.save();
    res.json({ ...url.toObject(), shortUrl: `${process.env.BASE_URL}/${url.shortCode}` });
  } catch (err) {
    next(err);
  }
};

// GET /api/urls/:id/analytics
const getUrlAnalytics = async (req, res, next) => {
  try {
    const url = await Url.findOne({ _id: req.params.id, userId: req.user._id });
    if (!url) {
      return res.status(404).json({ message: 'URL not found' });
    }

    const visits = await Visit.find({ urlId: url._id }).sort({ visitedAt: -1 }).limit(100);

    // Build daily click trend for last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyClicks = await Visit.aggregate([
      {
        $match: {
          urlId: url._id,
          visitedAt: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$visitedAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Country breakdown
    const countryClicks = await Visit.aggregate([
      { $match: { urlId: url._id } },
      { $group: { _id: '$country', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    res.json({
      url: { ...url.toObject(), shortUrl: `${process.env.BASE_URL}/${url.shortCode}` },
      totalClicks: url.clickCount,
      lastVisitedAt: url.lastVisitedAt,
      recentVisits: visits,
      dailyClicks,
      countryBreakdown: countryClicks,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/urls/:shortCode/public-stats (no auth required)
const getPublicStats = async (req, res, next) => {
  try {
    const url = await Url.findOne({ shortCode: req.params.shortCode });
    if (!url) return res.status(404).json({ message: 'URL not found' });

    const dailyClicks = await Visit.aggregate([
      {
        $match: {
          urlId: url._id,
          visitedAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$visitedAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      shortCode: url.shortCode,
      shortUrl: `${process.env.BASE_URL}/${url.shortCode}`,
      originalUrl: url.originalUrl,
      totalClicks: url.clickCount,
      lastVisitedAt: url.lastVisitedAt,
      createdAt: url.createdAt,
      dailyClicks,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { createUrl, getUserUrls, deleteUrl, updateUrl, getUrlAnalytics, getPublicStats };
