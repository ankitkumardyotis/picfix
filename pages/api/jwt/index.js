import jwt from "jsonwebtoken";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import prisma from "@/lib/prisma";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  const { user } = session;

  if (req.method === "GET") {
    if (!session) {
      res
        .status(401)
        .json({ message: "Unauthorized access to the requested resource" });
      return;
    }

    const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET_KEY, {
      expiresIn: `${15}s`,
    });
    const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET_KEY);

    await prisma.CustomJWT.deleteMany({
      where: {
        userId: user.id,
      },
    });

    await prisma.CustomJWT.create({
      data: {
        userId: user.id,
        jwtRefreshToken: refreshToken,
      },
    });

    res.status(200).json({ accessToken, refreshToken });
  } else if (req.method === "POST") {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res
        .status(401)
        .json({ message: "Unauthorized access to the requested resource" });
      return;
    }

    const refreshToken = authHeader.split(" ")[1];

    if (!refreshToken) {
      res
        .status(401)
        .json({ message: "Unauthorized access to the requested resource" });
      return;
    }

    const allRefreshTokens = await prisma.CustomJWT.findMany({
      where: {
        userId: user.id,
      },
      select: {
        jwtRefreshToken: true,
      },
    });

    if (allRefreshTokens[0].jwtRefreshToken !== refreshToken) {
      res
        .status(403)
        .json({ message: "Access to the requested resource is forbidden" });
      return;
    }

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET_KEY, (error) => {
      if (error)
        res
          .status(403)
          .json({ message: "Access to the requested resource is forbidden" });
      const newAccessToken = jwt.sign(
        user,
        process.env.ACCESS_TOKEN_SECRET_KEY,
        {
          expiresIn: `${15}s`,
        },
      );

      res.status(200).json({ accessToken: newAccessToken });
    });
  }
  // else if (req.method === "DELETE") {
  //   const refreshToken = req.body.refreshToken;
  // }
}
