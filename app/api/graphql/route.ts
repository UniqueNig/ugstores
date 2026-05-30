import { resolvers, typeDefs } from "@/src/graphql";
import { ApolloServer } from "@apollo/server";
import jwt, { JwtPayload } from "jsonwebtoken";
import { connectDB } from "@/src/lib/db";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { NextRequest } from "next/server";

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

type AuthUser = JwtPayload & {
  id: string;
  role: string;
};



const getTokenFromRequest = (req: Request, role: "admin" | "user"): string | null => {
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) return authHeader.split(" ")[1];

  const cookieHeader = req.headers.get("cookie");
  if (cookieHeader) {
    const cookieName = role === "admin" ? "admin_token" : "user_token";
    const match = cookieHeader.match(new RegExp(`${cookieName}=([^;]+)`));
    if (match) return match[1];
  }
  return null;
};

const handler = startServerAndCreateNextHandler(server, {
  context: async (req: NextRequest) => {
    // Try admin token first, then user token
    const adminToken = getTokenFromRequest(req, "admin");
    const userToken = getTokenFromRequest(req, "user");

    // Use whichever is present — Apollo client now only sends the right one
    const token = adminToken || userToken;

    if (!token) return { user: null };

    try {
      const user = jwt.verify(token, process.env.JWT_SECRET!) as AuthUser;
      return { user };
    } catch {
      return { user: null };
    }
  },
});

export async function GET(req: NextRequest) {
  await connectDB();
  return handler(req);
}

export async function POST(req: NextRequest) {
  await connectDB();
  return handler(req);
}



