import jwt from "jsonwebtoken";

const authDoctor = async (req, res, next) => {
  try {
    const { dtoken } = req.headers;

    if (!dtoken) {
      return res.json({ success: false, message: "Not Authorized. Login Again." });
    }

    const decoded = jwt.verify(dtoken, process.env.JWT_SECRET);

    // ✅ Attach userId properly — for all request types
    req.docId = decoded.id;

    next();
  } catch (error) {
    console.log("Auth error:", error);
    res.json({ success: false, message: error.message });
  }
};

export default authDoctor;
