import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  provider: {
    type: String,
    default: "",
  },
  category: {
    type: String,
    default: "Programming",
  },
  difficulty: {
    type: String,
    default: "Beginner",
  },
  duration: {
    type: String,
    default: "",
  },
  language: {
    type: String,
    default: "English",
  },
  certificate: {
    type: Boolean,
    default: false,
  },
  description: {
    type: String,
    default: "",
  },
  skills: {
    type: [String],
    default: [],
  },
  status: {
    type: String,
    enum: ['Published', 'Draft', 'Archived'],
    default: 'Draft',
  },
  students: {
    type: Number,
    default: 0,
  },
  rating: {
    type: Number,
    default: 0,
  },
  thumbnail: {
    type: String,
    default: "",
  },
}, { timestamps: true });

// Transform output to replace _id with id
courseSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
  }
});

export const Course = mongoose.model('Course', courseSchema);
