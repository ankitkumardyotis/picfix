


export default async function handler(req, res) {
  const fileUrl = req.body.imageUrl;
  console.log(fileUrl);
  // POST request to Replicate to start the image restoration generation process
  let startResponse = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Token " + process.env.REPLICATE_API_KEY,
    },
    body: JSON.stringify({
      version:
        "018241a6c880319404eaa2714b764313e27e11f950a7ff0a7b5b37b27b74dcf7",
      input: { image: fileUrl, task_type: "Image Debluring (REDS)" },
    }),
  });

  let jsonStartResponse = await startResponse.json();
  // console.log(jsonStartResponse);
  let endpointUrl = jsonStartResponse.urls.get;

  // GET request to get the status of the image restoration process & return the result when it's ready
  let restoredImage = null;
  while (!restoredImage) {
    // Loop in 1s intervals until the alt text is ready
    console.log("polling for result...");
    let finalResponse = await fetch(endpointUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Token " + process.env.REPLICATE_API_KEY,
      },
    });
    let jsonFinalResponse = await finalResponse.json();

    if (jsonFinalResponse.status === "succeeded") {
      restoredImage = jsonFinalResponse.output;
      console.log(restoredImage);
    } else if (jsonFinalResponse.status === "failed") {
      break;
    } else {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  } res.status(200).json(restoredImage ? restoredImage : "Failed to restore Motion Blur image");
}