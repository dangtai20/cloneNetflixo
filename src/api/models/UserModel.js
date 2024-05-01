const mongoose = require("mongoose");
const bcryptjs = require("bcryptjs");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    first_name: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          return /^[\p{L}\s]+$/u.test(v);
        },
        message: (props) => `${props.value} is not a valid first name!`,
      },
    },
    last_name: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          return /^[\p{L}\s]+$/u.test(v);
        },
        message: (props) => `${props.value} is not a valid last name!`,
      },
    },
    email: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: function (v) {
          return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v);
        },
        message: (props) => `${props.value} is not a valid email!`,
      },
    },

    password: { type: String, required: true, select: false },
    image_url: { type: String },
    wallet: {
      type: Number,
      required: true,
      default: 0,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
    },
  },

  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcryptjs.hash(this.password, 10);
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcryptjs.compare(candidatePassword, userPassword);
};

module.exports = mongoose.model("User", userSchema);
