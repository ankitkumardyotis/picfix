import { connectToDatabase } from "@/utils/mongodb";
import { ObjectId } from "mongodb";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { bgMusicId, projectId, dataPointerId } = req.query;
    const { subtitleConfig } = req.body;

    if (!projectId || !dataPointerId) {
      return res.status(400).json({ message: "Missing required parameters" });
    }

    const { db } = await connectToDatabase();

    // Update the subtitle configuration in the data pointer
    const result = await db.collection("pointers").updateOne(
      {
        _id: new ObjectId(dataPointerId),
        projectId: projectId,
      },
      {
        $set: { subtitleConfig: subtitleConfig },
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Data pointer not found" });
    }

    // Also update the project to store the subtitle configuration at project level if needed
    await db.collection("projects").updateOne(
      { _id: new ObjectId(projectId) },
      {
        $set: { "defaultSubtitleConfig": subtitleConfig },
      }
    );

    return res.status(200).json({ 
      message: "Subtitle configuration updated successfully",
      subtitleConfig: subtitleConfig
    });
  } catch (error) {
    console.error("Error updating subtitle configuration:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
} 