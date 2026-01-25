import Property from '../models/Property.js';

/**
 * AI Price Prediction Service
 * This is a simplified implementation. In production, you would integrate
 * with ML models (TensorFlow, PyTorch) or third-party APIs.
 */

// Calculate property price prediction based on historical data and features
export const predictPropertyPrice = async (propertyData) => {
  try {
    const {
      location,
      specifications,
      propertyType,
      features,
      amenities,
    } = propertyData;

    // Get similar properties in the area
    const similarProperties = await Property.find({
      'location.city': location.city,
      'location.state': location.state,
      propertyType,
      status: { $in: ['Sold', 'Active'] },
    }).limit(50);

    if (similarProperties.length === 0) {
      return {
        estimatedValue: null,
        priceRange: { min: null, max: null },
        confidence: 0,
        message: 'Insufficient data for prediction',
      };
    }

    // Calculate average price per sqft in the area
    const avgPricePerSqft = similarProperties.reduce((sum, prop) => {
      return sum + (prop.price / prop.specifications.sqft);
    }, 0) / similarProperties.length;

    // Base price calculation
    let estimatedPrice = avgPricePerSqft * specifications.sqft;

    // Adjust for bedrooms (10% per bedroom above/below average)
    const avgBedrooms = similarProperties.reduce((sum, prop) => 
      sum + prop.specifications.bedrooms, 0) / similarProperties.length;
    const bedroomDiff = specifications.bedrooms - avgBedrooms;
    estimatedPrice *= (1 + (bedroomDiff * 0.1));

    // Adjust for bathrooms (5% per bathroom above/below average)
    const avgBathrooms = similarProperties.reduce((sum, prop) => 
      sum + prop.specifications.bathrooms, 0) / similarProperties.length;
    const bathroomDiff = specifications.bathrooms - avgBathrooms;
    estimatedPrice *= (1 + (bathroomDiff * 0.05));

    // Adjust for features and amenities (2% per premium feature)
    const premiumFeatures = ['Pool', 'Smart Home', 'Ocean View', 'City View', 'Gym'];
    const hasPremiumFeatures = features.filter(f => 
      premiumFeatures.some(pf => f.toLowerCase().includes(pf.toLowerCase()))
    ).length;
    estimatedPrice *= (1 + (hasPremiumFeatures * 0.02));

    // Calculate price range (±15%)
    const priceRange = {
      min: Math.round(estimatedPrice * 0.85),
      max: Math.round(estimatedPrice * 1.15),
    };

    return {
      estimatedValue: Math.round(estimatedPrice),
      priceRange,
      confidence: Math.min(similarProperties.length / 50, 1) * 100,
      dataPoints: similarProperties.length,
    };
  } catch (error) {
    throw new Error(`Price prediction failed: ${error.message}`);
  }
};

// Calculate investment score (0-100)
export const calculateInvestmentScore = async (propertyData) => {
  try {
    let score = 50; // Base score

    const { location, specifications, price, propertyType } = propertyData;

    // Get properties in the area from the last 2 years
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

    const recentProperties = await Property.find({
      'location.city': location.city,
      'location.state': location.state,
      createdAt: { $gte: twoYearsAgo },
    });

    if (recentProperties.length > 10) {
      score += 10; // Active market
    }

    // Price competitiveness
    const avgPrice = recentProperties.reduce((sum, prop) => sum + prop.price, 0) / recentProperties.length;
    const priceRatio = price / avgPrice;

    if (priceRatio < 0.9) score += 15; // Below market average
    else if (priceRatio < 1.1) score += 10; // At market average
    else score += 5; // Above market average

    // Property type demand
    const typeCount = recentProperties.filter(p => p.propertyType === propertyType).length;
    const typeDemand = typeCount / recentProperties.length;
    score += Math.round(typeDemand * 15);

    // Size optimization
    const avgSqft = recentProperties.reduce((sum, prop) => 
      sum + prop.specifications.sqft, 0) / recentProperties.length;
    const sqftRatio = specifications.sqft / avgSqft;
    
    if (sqftRatio >= 0.9 && sqftRatio <= 1.1) score += 10; // Optimal size

    return Math.min(Math.round(score), 100);
  } catch (error) {
    throw new Error(`Investment score calculation failed: ${error.message}`);
  }
};

// Analyze market trends
export const analyzeMarketTrend = async (location) => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const recentProperties = await Property.find({
      'location.city': location.city,
      'location.state': location.state,
      status: 'Sold',
      updatedAt: { $gte: sixMonthsAgo },
    }).sort('updatedAt');

    if (recentProperties.length < 5) {
      return {
        trend: 'Neutral',
        changePercent: 0,
        message: 'Insufficient data',
      };
    }

    // Calculate average price for first quarter and last quarter
    const midPoint = Math.floor(recentProperties.length / 2);
    const firstHalf = recentProperties.slice(0, midPoint);
    const secondHalf = recentProperties.slice(midPoint);

    const avgFirstHalf = firstHalf.reduce((sum, p) => sum + p.price, 0) / firstHalf.length;
    const avgSecondHalf = secondHalf.reduce((sum, p) => sum + p.price, 0) / secondHalf.length;

    const changePercent = ((avgSecondHalf - avgFirstHalf) / avgFirstHalf) * 100;

    let trend = 'Neutral';
    if (changePercent > 5) trend = 'Rising';
    else if (changePercent < -5) trend = 'Falling';

    return {
      trend,
      changePercent: changePercent.toFixed(2),
      averagePriceFirstHalf: Math.round(avgFirstHalf),
      averagePriceSecondHalf: Math.round(avgSecondHalf),
    };
  } catch (error) {
    throw new Error(`Market trend analysis failed: ${error.message}`);
  }
};

// Calculate demand score
export const calculateDemandScore = async (location, propertyType) => {
  try {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const recentViews = await Property.aggregate([
      {
        $match: {
          'location.city': location.city,
          'location.state': location.state,
          propertyType,
          updatedAt: { $gte: oneMonthAgo },
        },
      },
      {
        $group: {
          _id: null,
          totalViews: { $sum: '$views' },
          avgViews: { $avg: '$views' },
          count: { $sum: 1 },
        },
      },
    ]);

    if (recentViews.length === 0) {
      return 50; // Neutral score
    }

    const { avgViews, count } = recentViews[0];

    // Score based on average views and listing count
    let score = Math.min(avgViews / 10, 50); // Max 50 from views
    score += Math.min(count / 2, 50); // Max 50 from listing count

    return Math.min(Math.round(score), 100);
  } catch (error) {
    throw new Error(`Demand score calculation failed: ${error.message}`);
  }
};
