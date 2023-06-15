


export default async function handler(req, res) {
    const fileUrl = req.body.imageUrl;
    console.log("All the value including object removal text and imageUrl=>" + fileUrl);

    // POST request to Replicate to start the image restoration generation process
    let startResponse = await fetch("https://api.replicate.com/v1/predictions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: "Token " + process.env.REPLICATE_API_KEY,
        },
        body: JSON.stringify({
            version:
                "153b0087c2576ad30d8cbddb35275b387d1a6bf986bda5499948f843f6460faf",
            input: { image_path: fileUrl, objects_to_remove: 'person' },
        }),
    });

    let jsonStartResponse = await startResponse.json();
    console.log("Json response" + jsonStartResponse);
    let endpointUrl = jsonStartResponse.urls.get;
    console.log(endpointUrl);

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