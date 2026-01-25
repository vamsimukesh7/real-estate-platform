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

    res.json({
      success: true,
      message: 'Property blocked successfully',
      data: property
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

    res.json({
      success: true,
      message: 'Property unblocked successfully',
      data: property
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
