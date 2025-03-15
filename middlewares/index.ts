import { decodeToken, verifyToken } from "../utils/utils";

export const checkLogin = (req: any, res: any, next: any) => {
  try {
    var { redirectUrl } = req?.body;

    const token = req?.headers.authorization?.split(" ")[1];

    console.log({ token });

    let data: any = verifyToken(token);

    if (!data) {
      throw new Error("");
    }

    req["user"] = data;
    // req["body"]["user"] = data?.id;
    next();
  } catch (error) {
    console.log({ error });
    res.status(401).json({
      success: false,
      message: "User Unauthorized",
      redirectUrl,
    });
  }
};
