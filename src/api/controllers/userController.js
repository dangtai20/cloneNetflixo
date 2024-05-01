const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const User = require("../models/UserModel");
const { generateToken } = require("../services/tokenService");
const { sendVerificationEmail } = require("../services/mailService");

exports.registerUser = catchAsync(async (req, res, next) => {
  const requiredFields = ["first_name", "last_name", "email", "password"];
  const missingFields = requiredFields.filter((field) => !req.body[field]);

  if (missingFields.length) {
    return next(
      new AppError(`Missing required fields: ${missingFields.join(", ")}`, 400)
    );
  }

  const user = await User.create(req.body);
  const token = generateToken(user._id);

  const verificationToken = await sendVerificationEmail(user, req);
  await User.findByIdAndUpdate(user._id, { verificationToken });

  res.status(201).json({
    status: "success",
    message: "User registered successfully",
    data: {
      token,
    },
  });
});

exports.loginUser = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("Email and password are required", 400));
  }
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }

  delete user._doc.password;
  const token = generateToken(user);
  res.status(200).json({
    status: "success",
    message: "User logged in successfully",
    data: {
      token,
    },
  });
});

exports.verifyUser = catchAsync(async (req, res, next) => {
  const { token } = req.params;
  const user = await User.findOneAndUpdate(
    { verificationToken: token, isVerified: false },
    { isVerified: true, verificationToken: null },
    { new: true }
  );
  if (!user) {
    return next(new AppError("Invalid or expired token", 400));
  }
  res.status(200).json({
    status: "success",
    message: "User verified successfully",
    data: {
      user: {
        id: user._id,
        email: user.email,
        isVerified: user.isVerified,
      },
    },
  });
});
