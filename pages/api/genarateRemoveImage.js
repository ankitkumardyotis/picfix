export default async function handler(req, res) {
  console.log(req.body);
    const fileUrl = req.body.imageUrl;
    console.log("file url in Remove BG =>" + fileUrl);
  
    // POST request to Replicate to start the image restoration generation process
    let startResponse = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Token " + process.env.REPLICATE_API_KEY,
      },
      body: JSON.stringify({
        version:
          "fb8af171cfa1616ddcf1242c093f9c46bcada5ad4cf6f2fbe8b81b330ec5c003",
        input: { image: fileUrl},
      }),
    });
  
    let jsonStartResponse = await startResponse.json();
    console.log("Json response in rem bg" + jsonStartResponse);
    let endpointUrl = jsonStartResponse.urls.get;
    console.log(process.env.REPLICATE_API_KEY);
  
    // // GET request to get the status of the image restoration process & return the result when it's ready
    let removeBackground = null;
    while (!removeBackground) {
      // Loop in 1s intervals until the alt text is ready
      console.log("polling for result in Remove Background...");
      let finalResponse = await fetch(endpointUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Token " + process.env.REPLICATE_API_KEY,
        },
      });
      let jsonFinalResponse = await finalResponse.json();
  
      if (jsonFinalResponse.status === "succeeded") {
        removeBackground = jsonFinalResponse.output;
        // console.log(restoredImage);
      } else if (jsonFinalResponse.status === "failed") {
        break;
      } else {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    } res.status(200).json(removeBackground ? removeBackground : "Failed to restore image");
  }