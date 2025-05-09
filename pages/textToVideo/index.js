import "react-responsive-carousel/lib/styles/carousel.min.css";
import React from "react";
import ExplorePageContainer from "@/components/ExplorePageContainer";

function textToVideo() {
  const imagesPath = [
    "/assets/text-to-video-sample.mp4"
  ];

  const heading =
    "Turn your words into stunning videos. Easy, creative storytelling redefined";

  const description =
    "Transform text into engaging videos instantly. Explore various styles and templates for dynamic and creative storytelling. Enhance your content effortlessly with Text to Video!";
  const routePath = "/textToVideo/projects";
  const buttonTwoText = "Try Text to Video";

  return (
    <ExplorePageContainer
      imagesPath={imagesPath}
      heading={heading}
      description={description}
      buttonTwoText={buttonTwoText}
      routePath={routePath}
    />
  );
}

export default textToVideo;