


export default async function handler(req, res) {
  const fileUrl = req.body.imageUrl;
  const prompt = req.body.prompt;
  const clothingPosition=req.body.clothingPosition;
  console.log(fileUrl, prompt, clothingPosition);
  console.log("Clothing Fashion=>" + fileUrl);
  // POST request to Replicate to start the image  generation process
  let startResponse = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Token " + process.env.REPLICATE_API_KEY,
    },
    body: JSON.stringify({
      version:
        "f203e9b8755a51b23f8ebdd80bb4f8b7177685b8d3fcca949abfbf8606b6d42a",
      input: {
        image: fileUrl,
        clothing: clothingPosition,
        prompt: "a person wearing " + prompt + ", best quality, extremely detailed, photo from Pinterest, interior, cinematic photo, ultra-detailed, ultra-realistic, award-winning"
      },
    }),
  });

  let jsonStartResponse = await startResponse.json();
  let endpointUrl = jsonStartResponse.urls.get;

  // // GET request to get the status of the image  process & return the result when it's ready
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
    console.log("Json response" + jsonStartResponse.output);


    if (jsonFinalResponse.status === "succeeded") {
      restoredImage = jsonFinalResponse.output;
    } else if (jsonFinalResponse.status === "failed") {
      break;
    } else {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  } res.status(200).json(restoredImage ? restoredImage : "Failed to restore image");
}