const mongoose = require("mongoose");

const GroupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // Group Name
    contributionAmount: { type: String, required: true }, // Contribution amount
    frequency: { type: String, enum: ["Weekly", "Monthly"], required: true }, // Weekly or Monthly
    requiredMembers: { type: Number, required: true }, // How many members needed
    image: { type: String, default: "" }, // Group image URL
    description: { type: String, default: "No description provided." }, // Description
    slots: { type: Number, required: true }, // Total slots available
    handler: { type: String, required: true }, // Organizer/Handler name
    contractAddress: { type: String, default: "" }, // Blockchain contract address (if applicable)
    members: { type: Array, default: [] }, // Array of members who joined
    status: { type: String, enum: ["open", "active", "completed"], default: "open" }, // Group status
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt fields
);

// Export Group model
module.exports = mongoose.model("Group", GroupSchema);
