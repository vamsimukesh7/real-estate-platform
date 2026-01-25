import Property from '../models/Property.js';
import User from '../models/User.js';
import { createNotification } from './userController.js';
import Transaction from '../models/Transaction.js';

// @desc    Get all properties
// @route   GET /api/properties
// @access  Public
export const getProperties = async (req, res) => {
  try {
    const {
      city,
      state,
      propertyType,
      listingType,
      minPrice,
      maxPrice,
      bedrooms,
      bathrooms,
      minSqft,
      maxSqft,
      status,
      featured,
      page = 1,
      limit = 12,
      sort = '-createdAt',
    } = req.query;

    const query = {};

    // Build query filters
    if (city) query['location.city'] = new RegExp(city, 'i');
    if (state) query['location.state'] = new RegExp(state, 'i');
    if (propertyType) query.propertyType = propertyType;
    if (listingType) query.listingType = listingType;
    if (status) query.status = status;
    if (featured) query.featured = featured === 'true';

    // Price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Specifications
    if (bedrooms) query['specifications.bedrooms'] = { $gte: Number(bedrooms) };
    if (bathrooms) query['specifications.bathrooms'] = { $gte: Number(bathrooms) };
    
    if (minSqft || maxSqft) {
      query['specifications.sqft'] = {};
      if (minSqft) query['specifications.sqft'].$gte = Number(minSqft);
      if (maxSqft) query['specifications.sqft'].$lte = Number(maxSqft);
    }

    // Filter out blocked properties for non-admin users
    // Check if user is authenticated and is admin
    const isAdmin = req.user && req.user.role === 'Admin';
    if (!isAdmin) {
      query.blocked = { $ne: true }; // Hide blocked properties for non-admins
    }

    const skip = (page - 1) * limit;

    const properties = await Property.find(query)
      .populate('owner', 'name email avatar')
      .populate('agent', 'name email phone avatar agentDetails')
      .sort(sort)
      .limit(Number(limit))
      .skip(skip);

    const total = await Property.countDocuments(query);

    const mappedProperties = properties.map(p => ({
        id: p._id,
        name: p.name,
        price: p.price,
        location: typeof p.location === 'string' ? p.location : (p.location?.address || 'Unknown'),
        image: p.images?.[0]?.url || 'https://images.unsplash.com/photo-1580587771525-78b9dba3b91d?w=800&q=80',
        beds: p.specifications?.bedrooms || 0,
        baths: p.specifications?.bathrooms || 0,
        sqft: p.specifications?.sqft || 0, // Frontend might not use this strictly but good to have
        type: p.propertyType,
        propertyType: p.propertyType, // Include both for compatibility
        listingType: p.listingType, // Add listingType for Buy/Rent filtering
        status: p.status,
        blocked: p.blocked || false,
        blockReason: p.blockReason || '',
        badge: p.status === 'Sold' ? 'Sold' : (p.status === 'Rented' ? 'Rented' : (p.status === 'Pending' ? 'Pending Approval' : (p.featured ? 'Featured' : 'New'))),
        tags: p.features || [],
        owner: p.owner,
        agent: p.agent,
        pendingBuyer: p.pendingBuyer,
        views: p.views || 0,
        // Check if current user saved the property. 
        // p.saves is an array of IDs.
        isSaved: req.user ? p.saves && p.saves.some(id => id.toString() === req.user._id.toString()) : false
    }));

    res.json({
      success: true,
      count: properties.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      data: mappedProperties, // Send mapped properties
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single property
// @route   GET /api/properties/:id
// @access  Public
export const getProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate('owner', 'name email phone avatar')
      .populate('agent', 'name email phone avatar agentDetails');

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    // Increment views
    property.views += 1;
    await property.save();

    res.json({ success: true, data: property });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create property
// @route   POST /api/properties
// @access  Private (Agent/Admin)
export const createProperty = async (req, res) => {
  try {
    // Map frontend flat structure to backend schema
    const { name, price, location, type, status, beds, baths, sqft, image } = req.body;

    // Determine listing type from status or default to Sale
    let listingType = 'Sale';
    if (status === 'For Rent' || status === 'Rented') {
        listingType = 'Rent';
    } else if (status === 'For Sale' || status === 'Sold') {
        listingType = 'Sale';
    }

    const propertyData = {
        name,
        price,
        location, // Can be string now
        propertyType: type,
        status: 'Active', // Always start as Active unless specified
        // But map modal "Status" to listingType logic, and reset status to Active
        // If user selected "Sold" in modal, maybe start as Sold? But usually creating new listing implies Active.
        // Let's assume intent is Active listing of that type.
        
        specifications: {
            bedrooms: Number(beds) || 0,
            bathrooms: Number(baths) || 0,
            sqft: Number(sqft) || 0
        },
        images: image ? [{ url: image }] : [],
        description: 'Added via Dashboard', // Default
        listingType: listingType, 
        owner: req.user ? req.user._id : '000000000000000000000000'
    };
    if (req.user) propertyData.owner = req.user._id;

    const property = await Property.create(propertyData);

    // Trigger New Listing Notification for all users
    try {
        const users = await User.find({ _id: { $ne: req.user?._id } }); // All users except the owner
        const title = 'New Property Listed! 🏠';
        const message = `A new ${property.propertyType} named "${property.name}" has been listed at $${property.price.toLocaleString()} in ${typeof property.location === 'string' ? property.location : 'your area'}.`;
        const link = `/properties/${property._id}`;

        // Notify users
        for (const user of users) {
            await createNotification(user._id, 'NewListing', title, message, link);
        }
    } catch (notifErr) {
        console.error('Error triggering new listing notifications:', notifErr);
    }

    // Return the mapped format for the frontend to add to list directly
    const mappedProperty = {
        id: property._id,
        name: property.name,
        price: property.price,
        location: typeof property.location === 'string' ? property.location : (property.location?.address || 'Unknown'),
        image: property.images?.[0]?.url || 'https://images.unsplash.com/photo-1580587771525-78b9dba3b91d?w=800&q=80',
        beds: property.specifications?.bedrooms || 0,
        baths: property.specifications?.bathrooms || 0,
        sqft: property.specifications?.sqft || 0,
        type: property.propertyType,
        propertyType: property.propertyType,
        listingType: property.listingType,
        status: property.status,
        blocked: property.blocked || false,
        badge: property.status === 'Sold' ? 'Sold' : (property.status === 'Rented' ? 'Rented' : (property.status === 'Pending' ? 'Pending Approval' : (property.featured ? 'Featured' : 'New'))),
        tags: property.features || [],
        owner: property.owner,
        agent: property.agent,
        pendingBuyer: property.pendingBuyer,
        views: property.views || 0,
        isSaved: false // New property not saved yet
    };

    res.status(201).json({ success: true, data: mappedProperty });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update property
// @route   PUT /api/properties/:id
// @access  Private (Owner/Agent/Admin)
export const updateProperty = async (req, res) => {
  try {
    let property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    // Check ownership safely
    const ownerId = property.owner ? property.owner.toString() : null;
    if (
      ownerId !== req.user._id.toString() &&
      req.user.role !== 'Admin'
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this property' });
    }

    const oldPrice = property.price;
    const newPrice = req.body.price;

    console.log(`[UpdateProperty] Updating ${req.params.id} with:`, JSON.stringify(req.body, null, 2));

    property = await Property.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    // Trigger Price Drop Notification if price is lowered
    if (newPrice && newPrice < oldPrice) {
      const savedByUsers = property.saves || [];
      const title = 'Price Drop Alert! 📉';
      const message = `The price for "${property.name}" has dropped from $${oldPrice.toLocaleString()} to $${newPrice.toLocaleString()}!`;
      const link = `/properties/${property._id}`;

      // Notify all users who saved this property
      for (const userId of savedByUsers) {
        await createNotification(userId, 'PriceAlert', title, message, link);
      }
    }

    const mappedProperty = {
        id: property._id,
        name: property.name,
        price: property.price,
        location: typeof property.location === 'string' ? property.location : (property.location?.address || 'Unknown'),
        image: property.images?.[0]?.url || 'https://images.unsplash.com/photo-1580587771525-78b9dba3b91d?w=800&q=80',
        beds: property.specifications?.bedrooms || 0,
        baths: property.specifications?.bathrooms || 0,
        sqft: property.specifications?.sqft || 0,
        type: property.propertyType,
        propertyType: property.propertyType,
        listingType: property.listingType,
        status: property.status,
        views: property.views || 0,
        blocked: property.blocked || false,
        blockReason: property.blockReason || '',
        badge: property.status === 'Sold' ? 'Sold' : (property.status === 'Rented' ? 'Rented' : (property.status === 'Pending' ? 'Pending Approval' : (property.featured ? 'Featured' : 'New'))),
        tags: property.features || []
    };

    res.json({ success: true, data: mappedProperty });
  } catch (error) {
    console.error('Update Property Error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete property
// @route   DELETE /api/properties/:id
// @access  Private (Owner/Admin)
export const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    // Check ownership
    if (
      property.owner.toString() !== req.user._id.toString() &&
      req.user.role !== 'Admin'
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await property.deleteOne();

    res.json({ success: true, message: 'Property deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Save/Unsave property
// @route   POST /api/properties/:id/save
// @access  Private
export const toggleSaveProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    // Fetch the user to update their savedProperties array
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isSaved = property.saves.some(id => id.toString() === req.user._id.toString());

    if (isSaved) {
      // Remove from both sides
      property.saves = property.saves.filter(
        (id) => id.toString() !== req.user._id.toString()
      );
      user.savedProperties = user.savedProperties.filter(
        (id) => id.toString() !== req.params.id
      );
    } else {
      // Add to both sides (prevent duplicates)
      const userId = req.user._id.toString();
      const propId = req.params.id;

      if (!property.saves.some(id => id.toString() === userId)) {
        property.saves.push(req.user._id);
      }
      if (!user.savedProperties.some(id => id.toString() === propId)) {
        user.savedProperties.push(req.params.id);
      }
    }

    // Save both documents
    await property.save();
    await user.save();

    res.json({
      success: true,
      saved: !isSaved,
      message: isSaved ? 'Property unsaved' : 'Property saved',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get featured properties
// @route   GET /api/properties/featured
// @access  Public
export const getFeaturedProperties = async (req, res) => {
  try {
    const properties = await Property.find({ featured: true, status: 'Active' })
      .populate('owner', 'name email avatar')
      .populate('agent', 'name email phone avatar agentDetails')
      .sort('-createdAt')
      .limit(6);

    res.json({ success: true, count: properties.length, data: properties });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// Add these functions to propertyController.js

// @desc    Block property (Admin only)
// @route   PUT /api/properties/:id/block
// @access  Private (Admin only)
export const blockProperty = async (req, res) => {
  try {
    const { reason } = req.body;
    
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    // Only admin can block
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Only admins can block properties' });
    }

    property.blocked = true;
    property.blockReason = reason || 'Incorrect or suspicious information';
    await property.save();

    const mappedProperty = {
        id: property._id,
        name: property.name,
        price: property.price,
        location: typeof property.location === 'string' ? property.location : (property.location?.address || 'Unknown'),
        image: property.images?.[0]?.url || 'https://images.unsplash.com/photo-1580587771525-78b9dba3b91d?w=800&q=80',
        beds: property.specifications?.bedrooms || 0,
        baths: property.specifications?.bathrooms || 0,
        sqft: property.specifications?.sqft || 0,
        type: property.propertyType,
        propertyType: property.propertyType,
        listingType: property.listingType,
        status: property.status,
        views: property.views || 0,
        blocked: property.blocked || false,
        blockReason: property.blockReason || '',
        badge: property.status === 'Sold' ? 'Sold' : (property.status === 'Rented' ? 'Rented' : (property.featured ? 'Featured' : 'New')),
        tags: property.features || []
    };

    res.json({
      success: true,
      message: 'Property blocked successfully',
      data: mappedProperty
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Unblock property (Admin only)
// @route   PUT /api/properties/:id/unblock
// @access  Private (Admin only)
export const unblockProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    // Only admin can unblock
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Only admins can unblock properties' });
    }

    property.blocked = false;
    property.blockReason = '';
    await property.save();

    const mappedProperty = {
        id: property._id,
        name: property.name,
        price: property.price,
        location: typeof property.location === 'string' ? property.location : (property.location?.address || 'Unknown'),
        image: property.images?.[0]?.url || 'https://images.unsplash.com/photo-1580587771525-78b9dba3b91d?w=800&q=80',
        beds: property.specifications?.bedrooms || 0,
        baths: property.specifications?.bathrooms || 0,
        sqft: property.specifications?.sqft || 0,
        type: property.propertyType,
        propertyType: property.propertyType,
        listingType: property.listingType,
        status: property.status,
        views: property.views || 0,
        blocked: property.blocked || false,
        blockReason: property.blockReason || '',
        badge: property.status === 'Sold' ? 'Sold' : (property.status === 'Rented' ? 'Rented' : (property.featured ? 'Featured' : 'New')),
        tags: property.features || []
    };

    res.json({
      success: true,
      message: 'Property unblocked successfully',
      data: mappedProperty
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get analytics data for dashboard
// @route   GET /api/properties/analytics
// @access  Private (Admin only)
export const getAnalyticsDashboard = async (req, res) => {
  try {
    const properties = await Property.find({});
    
    // 1. Basic Stats
    const totalProperties = properties.length;
    const soldCount = properties.filter(p => p.status === 'Sold').length;
    const rentedCount = properties.filter(p => p.status === 'Rented').length;
    
    // Total views across all properties
    const totalViews = properties.reduce((sum, p) => sum + (p.views || 0), 0);
    
    // Total revenue from both sales and rents
    const totalRevenue = properties
        .filter(p => p.status === 'Sold' || p.status === 'Rented')
        .reduce((sum, p) => sum + (p.price || 0), 0);
    
    // 2. Property Type Distribution
    const typeMap = {};
    properties.forEach(p => {
        const type = p.propertyType || 'Other';
        typeMap[type] = (typeMap[type] || 0) + 1;
    });
    const typeDistribution = Object.entries(typeMap).map(([name, value]) => ({ name, value }));

    // 3. Listing Type (Sale vs Rent)
    const listingMap = { Sale: 0, Rent: 0 };
    properties.forEach(p => {
        if (p.listingType === 'Rent') listingMap.Rent++;
        else listingMap.Sale++;
    });
    const listingDistribution = Object.entries(listingMap).map(([name, value]) => ({ name, value }));

    // 4. Monthly Trend (Simulated based on creation date)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    const trend = [];
    
    for (let i = 5; i >= 0; i--) {
        const monthIndex = (currentMonth - i + 12) % 12;
        const monthName = months[monthIndex];
        
        // Count properties added in this month (simplified)
        const count = properties.filter(p => new Date(p.createdAt).getMonth() === monthIndex).length;
        const revenue = properties
            .filter(p => p.status === 'Sold' && new Date(p.createdAt).getMonth() === monthIndex)
            .reduce((sum, p) => sum + (p.price || 0), 0);

        trend.push({
            name: monthName,
            listings: count,
            revenue: revenue / 1000 // In thousands for graph
        });
    }

    // 5. City-wise Breakdown
    const cityMap = {};
    properties.forEach(p => {
        const city = typeof p.location === 'string' ? p.location.split(',').pop().trim() : (p.location?.city || 'Unknown');
        cityMap[city] = (cityMap[city] || 0) + 1;
    });
    const cityBreakdown = Object.entries(cityMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, value]) => ({ name, value }));

    // 6. Price Tiers
    const tiers = {
        'Budget (<250k)': 0,
        'Mid-Range (250k-750k)': 0,
        'Luxury (750k-2M)': 0,
        'Ultra-Luxury (2M+)': 0
    };
    properties.forEach(p => {
        if (p.price < 250000) tiers['Budget (<250k)']++;
        else if (p.price < 750000) tiers['Mid-Range (250k-750k)']++;
        else if (p.price < 2000000) tiers['Luxury (750k-2M)']++;
        else tiers['Ultra-Luxury (2M+)']++;
    });
    const priceTiers = Object.entries(tiers).map(([name, value]) => ({ name, value }));

    res.json({
        success: true,
        data: {
            stats: {
                totalProperties,
                soldProperties: soldCount,
                rentedProperties: rentedCount,
                totalRevenue,
                totalViews,
                avgPrice: totalProperties > 0 ? Math.round(totalRevenue / ((soldCount + rentedCount) || 1)) : 0
            },
            typeDistribution,
            listingDistribution,
            trend,
            cityBreakdown,
            priceTiers,
            generatedAt: new Date()
        }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// @desc    Buy/Book property using wallet
// @route   POST /api/properties/:id/buy
// @access  Private (Buyer)
// @desc    Initiate Buy/Book property (Buyer intent)
// @route   POST /api/properties/:id/buy
// @access  Private (Buyer)
export const buyProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    if (property.status === 'Sold' || property.status === 'Rented') {
      return res.status(400).json({ success: false, message: 'Property already sold or rented' });
    }

    if (property.status === 'Pending') {
      return res.status(400).json({ success: false, message: 'Purchase request already pending' });
    }

    // Role check: Only Buyer can buy
    if (req.user.role !== 'Buyer') {
        return res.status(403).json({ success: false, message: 'Only Buyers can purchase properties.' });
    }

    // Check if user contains the property (is owner)
    if (property.owner && property.owner.toString() === req.user._id.toString()) {
        return res.status(400).json({ success: false, message: 'You cannot purchase your own property' });
    }

    const buyer = await User.findById(req.user._id);
    if (buyer.walletBalance < property.price) {
      return res.status(400).json({ success: false, message: 'Insufficient wallet balance to initiate purchase' });
    }

    // Set status to Pending and record the buyer
    property.status = 'Pending';
    property.pendingBuyer = buyer._id;
    await property.save();

    // Notify Seller
    if (property.owner) {
      await createNotification(
        property.owner,
        'Booking',
        'New Purchase Request! 📩',
        `A buyer (${buyer.name}) has requested to purchase ${property.name}. Please approve it to complete the transaction.`,
        `/dashboard`
      );
    }

    const mappedProperty = {
        id: property._id,
        name: property.name,
        price: property.price,
        location: typeof property.location === 'string' ? property.location : (property.location?.address || 'Unknown'),
        image: property.images?.[0]?.url || 'https://images.unsplash.com/photo-1580587771525-78b9dba3b91d?w=800&q=80',
        beds: property.specifications?.bedrooms || 0,
        baths: property.specifications?.bathrooms || 0,
        sqft: property.specifications?.sqft || 0,
        type: property.propertyType,
        propertyType: property.propertyType,
        listingType: property.listingType,
        status: property.status,
        views: property.views || 0,
        blocked: property.blocked || false,
        badge: property.status === 'Sold' ? 'Sold' : (property.status === 'Rented' ? 'Rented' : (property.status === 'Pending' ? 'Pending Approval' : (property.featured ? 'Featured' : 'New'))),
        owner: property.owner,
        agent: property.agent,
        pendingBuyer: property.pendingBuyer,
    };

    res.json({
      success: true,
      message: 'Purchase request sent successfully. Waiting for seller approval.',
      data: mappedProperty
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Approve/Accept purchase request (Seller action)
// @route   POST /api/properties/:id/approve
// @access  Private (Seller/Owner)
export const approveBuy = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    if (property.status !== 'Pending' || !property.pendingBuyer) {
      return res.status(400).json({ success: false, message: 'No pending purchase request found for this property' });
    }

    // Check if requester is the owner or agent
    const ownerId = property.owner ? property.owner.toString() : null;
    const agentId = property.agent ? property.agent.toString() : null;
    const requesterId = req.user._id.toString();

    console.log(`[Approval] Request by ${requesterId} for property ${property._id}. Owner: ${ownerId}, Agent: ${agentId}`);

    if (ownerId !== requesterId && agentId !== requesterId && req.user.role !== 'Admin') {
      console.warn(`[Approval] Unauthorised attempt by ${requesterId}`);
      return res.status(403).json({ success: false, message: 'Not authorized to approve this purchase' });
    }

    const buyer = await User.findById(property.pendingBuyer);
    // Payment goes to owner first, then agent if no owner.
    const seller = await User.findById(property.owner || property.agent);

    if (!buyer) {
      console.error(`[Approval] Buyer ${property.pendingBuyer} not found`);
      return res.status(404).json({ success: false, message: 'Buyer not found' });
    }

    // FINAL TRANSACTION
    if (buyer.walletBalance < property.price) {
      // Revert status to Active if buyer can no longer afford
      property.status = 'Active';
      property.pendingBuyer = undefined;
      await property.save();
      return res.status(400).json({ success: false, message: 'Buyer has insufficient balance now. Request cancelled.' });
    }

    // 1. Deduct from buyer
    buyer.walletBalance -= property.price;
    await buyer.save();

    // 2. Add to seller
    if (seller) {
      seller.walletBalance += property.price;
      await seller.save();
    }

    // 3. Update property status
    const oldBuyer = property.pendingBuyer;
    if (property.listingType === 'Rent') {
        property.status = 'Rented';
        property.tenant = oldBuyer;
        const days = 30; 
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + days);
        property.rentedUntil = endDate;
    } else {
        property.status = 'Sold';
        property.owner = oldBuyer; // Transfer ownership
    }
    
    property.pendingBuyer = undefined;
    await property.save();

    // 4. Create Transactions
    await Transaction.create({
      user: buyer._id,
      type: 'Payment',
      amount: -property.price,
      description: `Purchased property: ${property.name}`,
      reference: property._id,
      onModel: 'Property',
      status: 'Completed',
    });

    if (seller) {
      await Transaction.create({
        user: seller._id,
        type: 'Commission',
        amount: property.price,
        description: `Sold property: ${property.name}`,
        reference: property._id,
        onModel: 'Property',
        status: 'Completed',
      });
    }

    // 5. Notifications
    try {
      await createNotification(
        buyer._id,
        'Booking',
        'Property Purchase Approved! 🎉',
        `The seller has approved your purchase of ${property.name}. You are now the official owner/tenant.`,
        `/properties/${property._id}`
      );
    } catch (notifErr) {
      console.error('Error sending approval notification:', notifErr);
    }

    const mappedProperty = {
        id: property._id,
        name: property.name,
        price: property.price,
        location: typeof property.location === 'string' ? property.location : (property.location?.address || 'Unknown'),
        image: property.images?.[0]?.url || 'https://images.unsplash.com/photo-1580587771525-78b9dba3b91d?w=800&q=80',
        beds: property.specifications?.bedrooms || 0,
        baths: property.specifications?.bathrooms || 0,
        sqft: property.specifications?.sqft || 0,
        type: property.propertyType,
        propertyType: property.propertyType,
        listingType: property.listingType,
        status: property.status,
        views: property.views || 0,
        blocked: property.blocked || false,
        badge: property.status === 'Sold' ? 'Sold' : (property.status === 'Rented' ? 'Rented' : (property.status === 'Pending' ? 'Pending Approval' : (property.featured ? 'Featured' : 'New'))),
        owner: property.owner,
        agent: property.agent
    };

    res.json({
      success: true,
      message: 'Purchase approved and money transferred successfully',
      data: mappedProperty
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current user's properties (Context-aware: Buyer vs Seller)
// @route   GET /api/properties/my-properties
// @access  Private
export const getMyProperties = async (req, res) => {
  try {
    const userId = req.user._id;
    const isBuyer = req.user.role === 'Buyer';

    if (isBuyer) {
        // --- BUYER FLOW: Show what I bought/rented/requested ---
        const transactions = await Transaction.find({
            user: userId,
            type: 'Payment',
            status: 'Completed',
            onModel: 'Property'
        });
        const paidPropertyIds = transactions.map(t => t.reference);

        const pendingProperties = await Property.find({ pendingBuyer: userId, status: 'Pending' })
            .populate('owner', 'name email avatar');

        const explicitProperties = await Property.find({
            $or: [{ owner: userId }, { tenant: userId }],
            _id: { $nin: [...paidPropertyIds, ...pendingProperties.map(p => p._id)] },
            status: { $ne: 'Pending' }
        }).populate('owner', 'name email avatar');

        const paidProperties = await Property.find({ _id: { $in: paidPropertyIds } })
            .populate('owner', 'name email avatar');

        const owned = [];
        const rented = [];
        const pending = [];

        [...paidProperties, ...explicitProperties, ...pendingProperties].forEach(p => {
            const isRent = p.listingType === 'Rent' || p.propertyType === 'Rent';
            const mapped = {
                id: p._id,
                name: p.name,
                price: p.price,
                location: typeof p.location === 'string' ? p.location : (p.location?.address || 'Unknown'),
                image: p.images?.[0]?.url || 'https://images.unsplash.com/photo-1580587771525-78b9dba3b91d?w=800&q=80',
                beds: p.specifications?.bedrooms || 0,
                baths: p.specifications?.bathrooms || 0,
                sqft: p.specifications?.sqft || 0,
                type: p.propertyType,
                listingType: p.listingType,
                status: p.status,
                badge: p.status === 'Pending' ? 'Pending Approval' : (isRent ? 'Rented' : 'Sold'),
                pendingBuyer: p.pendingBuyer,
                owner: p.owner,
                agent: p.agent,
            };

            if (p.status === 'Pending') pending.push(mapped);
            else if (isRent) rented.push(mapped);
            else owned.push(mapped);
        });

        return res.json({ success: true, data: { owned, rented, pending } });

    } else {
        // --- SELLER/AGENT FLOW: Show what I listed ---
        const listings = await Property.find({ 
            $or: [{ owner: userId }, { agent: userId }] 
        }).populate('owner', 'name email avatar').populate('agent', 'name email phone avatar');

        const active = [];
        const pending = [];
        const sold = [];

        listings.forEach(p => {
            const mapped = {
                id: p._id,
                name: p.name,
                price: p.price,
                location: typeof p.location === 'string' ? p.location : (p.location?.address || 'Unknown'),
                image: p.images?.[0]?.url || 'https://images.unsplash.com/photo-1580587771525-78b9dba3b91d?w=800&q=80',
                beds: p.specifications?.bedrooms || 0,
                baths: p.specifications?.bathrooms || 0,
                sqft: p.specifications?.sqft || 0,
                type: p.propertyType,
                listingType: p.listingType,
                status: p.status,
                badge: p.status === 'Pending' ? 'Pending Approval' : (p.status === 'Sold' ? 'Sold' : (p.status === 'Rented' ? 'Rented' : 'Active')),
                pendingBuyer: p.pendingBuyer,
                owner: p.owner,
                agent: p.agent,
            };

            if (p.status === 'Pending') pending.push(mapped);
            else if (p.status === 'Sold' || p.status === 'Rented') sold.push(mapped);
            else active.push(mapped);
        });

        return res.json({ success: true, data: { active, pending, sold } });
    }
  } catch (error) {
    console.error('MyProps Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
