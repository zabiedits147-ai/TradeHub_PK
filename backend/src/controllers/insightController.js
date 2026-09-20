const Bid = require('../models/Bid');
const Product = require('../models/Product');

// @route  GET /api/insights
// @desc   Generate live market insights from real bidding/product data
exports.getMarketInsights = async (req, res) => {
  try {
    const insights = [];

    // Insight 1: Most actively bid-on product (trending)
    const trendingAgg = await Bid.aggregate([
      { $group: { _id: '$product', bidCount: { $sum: 1 }, avgOffer: { $avg: '$offerAmount' } } },
      { $sort: { bidCount: -1 } },
      { $limit: 1 },
    ]);

    if (trendingAgg.length > 0) {
      const product = await Product.findById(trendingAgg[0]._id);
      if (product) {
        const avgDiscount = Math.round(((product.originalPrice - trendingAgg[0].avgOffer) / product.originalPrice) * 100);
        insights.push({
          id: 'trending',
          tag: 'TREND ALERT',
          tagColor: 'primary',
          title: `${product.title} is trending with ${trendingAgg[0].bidCount} active offer${trendingAgg[0].bidCount > 1 ? 's' : ''}`,
          subtitle: `Buyers are offering ~${avgDiscount}% below listed price on average`,
        });
      }
    }

    // Insight 2: Recently listed products (new supply)
    const recentProduct = await Product.findOne().sort({ createdAt: -1 });
    if (recentProduct) {
      const hoursAgo = Math.round((Date.now() - new Date(recentProduct.createdAt)) / (1000 * 60 * 60));
      insights.push({
        id: 'new-listing',
        tag: 'NEW LISTING',
        tagColor: 'accentOrange',
        title: `${recentProduct.title} just listed at Rs. ${recentProduct.originalPrice.toLocaleString()}`,
        subtitle: hoursAgo < 1 ? 'Listed less than an hour ago' : `Listed ${hoursAgo}h ago`,
      });
    }

    // Insight 3: Accepted deals (successful trades)
    const acceptedCount = await Bid.countDocuments({ status: 'accepted' });
    if (acceptedCount > 0) {
      insights.push({
        id: 'deals-closed',
        tag: 'MARKET ACTIVITY',
        tagColor: 'primary',
        title: `${acceptedCount} deal${acceptedCount > 1 ? 's' : ''} successfully closed on TradeHub PK`,
        subtitle: 'Verified wholesalers are actively trading this week',
      });
    }

    res.status(200).json(insights);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route  GET /api/insights/volume
// @desc   Calculate today's trading volume (sum of accepted bids) + growth % vs yesterday
exports.getTradingVolume = async (req, res) => {
  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);

    const todayAgg = await Bid.aggregate([
      { $match: { status: 'accepted', updatedAt: { $gte: startOfToday } } },
      { $group: { _id: null, total: { $sum: '$offerAmount' } } },
    ]);
    const yesterdayAgg = await Bid.aggregate([
      { $match: { status: 'accepted', updatedAt: { $gte: startOfYesterday, $lt: startOfToday } } },
      { $group: { _id: null, total: { $sum: '$offerAmount' } } },
    ]);

    const todayTotal = todayAgg[0]?.total || 0;
    const yesterdayTotal = yesterdayAgg[0]?.total || 0;

    let growthPercent = 0;
    if (yesterdayTotal > 0) {
      growthPercent = Math.round(((todayTotal - yesterdayTotal) / yesterdayTotal) * 1000) / 10;
    } else if (todayTotal > 0) {
      growthPercent = 100;
    }

    res.status(200).json({ volume: todayTotal, growthPercent });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};