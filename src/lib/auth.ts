import jwt from "jsonwebtoken";

export const generateToken = (user: { _id: string; role?: string }) => {
  const isAdmin = ["admin", "superadmin"].includes(user.role || "");
  return jwt.sign(
    {
      id: user._id,
      role: user.role || "user",
    },
    process.env.JWT_SECRET!,
    // Customers stay signed in for a year (convenience, like big stores).
    // Admins re-authenticate weekly since their access is far more sensitive.
    { expiresIn: isAdmin ? "7d" : "365d" }
  );
};

// Short-lived, purpose-scoped token for password resets (no DB storage needed).
export const generatePasswordResetToken = (userId: string) =>
  jwt.sign({ id: userId, purpose: "reset" }, process.env.JWT_SECRET!, {
    expiresIn: "1h",
  });

export const verifyPasswordResetToken = (token: string): string | null => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
      purpose?: string;
    };
    if (decoded.purpose !== "reset") return null;
    return decoded.id;
  } catch {
    return null;
  }
};