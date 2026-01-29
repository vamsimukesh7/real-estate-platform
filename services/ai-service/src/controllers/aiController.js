import {
  predictPropertyPrice,
  calculateInvestmentScore,
  analyzeMarketTrend,
  calculateDemandScore,
} from '../ai/predictionService.js';
import Property from '../models/Property.js';

// @desc    Get AI price prediction
// @route   POST /api/ai/predict-price
// @access  Public
export const getPricePrediction = async (req, res) => {
  try {
    const prediction = await predictPropertyPrice(req.body);
    res.json({ success: true, data: prediction });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get investment score
// @route   POST /api/ai/investment-score
// @access  Public
export const getInvestmentScore = async (req, res) => {
  try {
    const score = await calculateInvestmentScore(req.body);
    res.json({ success: true, data: { score } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get market trend analysis
// @route   GET /api/ai/market-trend
// @access  Public
export const getMarketTrend = async (req, res) => {
  try {
    const { city, state } = req.query;
    
    if (!city || !state) {
      return res.status(400).json({ 
        success: false, 
        message: 'City and state are required' 
      });
    }

    const trend = await analyzeMarketTrend({ city, state });
    res.json({ success: true, data: trend });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get demand score
// @route   GET /api/ai/demand-score
// @access  Public
export const getDemandScore = async (req, res) => {
  try {
    const { city, state, propertyType } = req.query;
    
    if (!city || !state || !propertyType) {
      return res.status(400).json({ 
        success: false, 
        message: 'City, state, and property type are required' 
      });
    }

    const score = await calculateDemandScore({ city, state }, propertyType);
    res.json({ success: true, data: { score } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update property with AI predictions
// @route   POST /api/ai/update-property/:id
// @access  Private (Admin)
export const updatePropertyPredictions = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    // Get all AI predictions
    const [pricePrediction, investmentScore, marketTrend, demandScore] = await Promise.all([
      predictPropertyPrice(property),
      calculateInvestmentScore(property),
      analyzeMarketTrend(property.location),
      calculateDemandScore(property.location, property.propertyType),
    ]);

    // Update property with AI data
    property.aiPredictions = {
      estimatedValue: pricePrediction.estimatedValue,
      priceRange: pricePrediction.priceRange,
      investmentScore,
      marketTrend: marketTrend.trend,
      demandScore,
      lastUpdated: new Date(),
    };

    await property.save();

    res.json({
      success: true,
      message: 'AI predictions updated',
      data: property.aiPredictions,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
