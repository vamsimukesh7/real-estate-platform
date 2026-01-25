import mongoose from 'mongoose';

const propertySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Property name is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0,
    },
    location: {
      type: mongoose.Schema.Types.Mixed, // Allow string or object
      required: true
    },
    propertyType: {
      type: String,
      enum: ['House', 'Apartment', 'Condo', 'Villa', 'Townhouse', 'Land'],
    },
    listingType: {
      type: String,
      enum: ['Sale', 'Rent', 'Lease'],
    },
    specifications: {
      bedrooms: { type: Number },
      bathrooms: { type: Number },
      sqft: { type: Number },
      lotSize: Number,
      yearBuilt: Number,
      floors: Number,
      parking: Number,
    },
    features: [{
      type: String,
    }],
    amenities: [{
      type: String,
    }],
    images: [{
      url: String,
      publicId: String,
      caption: String,
    }],
    videos: [{
      url: String,
      publicId: String,
    }],
    virtualTour: {
      url: String,
      provider: String,
    },
    status: {
      type: String,
      enum: ['Active', 'Pending', 'Sold', 'Rented', 'Inactive'],
      default: 'Active',
    },
    featured: {
      type: Boolean,
      default: false,
    },
    owner: {
      type: String, // Store User ID as string from Auth Service
      required: true,
    },
    agent: {
      type: String, // Store Agent ID as string from Auth Service
    },
    views: {
      type: Number,
      default: 0,
    },
    saves: [{
      type: String, // Store User IDs as strings
    }],
    aiPredictions: {
      estimatedValue: Number,
      priceRange: {
        min: Number,
        max: Number,
      },
      investmentScore: Number,
      marketTrend: String,
      demandScore: Number,
      lastUpdated: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
propertySchema.index({ 'location.city': 1, 'location.state': 1 });
propertySchema.index({ price: 1 });
propertySchema.index({ propertyType: 1 });
propertySchema.index({ status: 1 });
propertySchema.index({ featured: 1 });
propertySchema.index({ owner: 1 });

const Property = mongoose.model('Property', propertySchema);

export default Property;
