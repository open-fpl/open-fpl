import { NextApiRequest, NextApiResponse } from "next";
import { getEntryPicks } from "@open-fpl/app/features/Api/entry";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method === "GET") {
      const id =
        typeof req.query.id === "string" ? req.query.id : req.query.id[0];
      const event =
        typeof req.query.event === "string"
          ? req.query.event
          : req.query.event[0];
      res.status(200).json({ data: await getEntryPicks(+id, +event) });
    } else {
      res.status(405).json({ error: "Not allowed" });
    }
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: "Unexpected error" });
  }
}
