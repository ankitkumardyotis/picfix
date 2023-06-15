


export default async function handler(req, res) {
  const fileUrl = req.body.imageUrl;
  console.log("file url=>" + fileUrl);
  console.log(process.env.REPLICATE_API_KEY);
  // POST request to Replicate to start the image restoration generation process
  let startResponse = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Token " + process.env.REPLICATE_API_KEY,
    },
    body: JSON.stringify({
      version:
        "9283608cc6b7be6b65a8e44983db012355fde4132009bf99d976b2f0896856a3",
      input: { img: fileUrl, version: "v1.4", scale: 2 },
    }),
  });

  let jsonStartResponse = await startResponse.json();
  console.log("Json response" + jsonStartResponse);
  let endpointUrl = jsonStartResponse.urls.get;

  // // GET request to get the status of the image restoration process & return the result when it's ready
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
  } res.status(200).json(restoredImage ? restoredImage : "Failed to restore image");
}