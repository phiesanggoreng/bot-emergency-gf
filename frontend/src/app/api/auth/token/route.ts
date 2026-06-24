import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import * as jwt from "jsonwebtoken";

/**
 * API Route: /api/auth/token
 *
 * Returns a signed JWT that the frontend can send to the backend
 * in the Authorization header. This bridges NextAuth's encrypted
 * session cookie with a standard JWT the backend can verify.
 */
export async function GET(request: Request) {
  try {
    // getToken() decodes the NextAuth encrypted cookie
    const token = await getToken({
      req: request as unknown as import("next/server").NextRequest,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Sign a standard JWT with the shared secret
    const secret = process.env.NEXTAUTH_SECRET!;
    const accessToken = jwt.sign(
      {
        email: token.email,
        name: token.name,
        picture: token.picture,
        sub: token.sub,
      },
      secret,
      { expiresIn: "1h" }
    );

    return NextResponse.json({ accessToken });
  } catch (error) {
    console.error("Token generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate token" },
      { status: 500 }
    );
  }
}
