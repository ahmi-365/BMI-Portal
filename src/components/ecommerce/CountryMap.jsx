// react plugin for creating vector maps
import { VectorMap } from "@react-jvectormap/core";
import { worldMill } from "@react-jvectormap/world";

const CountryMap = ({ mapColor }) => {
  const markers = [
    { latLng: [37.0902, -95.7129], name: "United States" },
    { latLng: [20.5937, 78.9629], name: "India" },
    { latLng: [55.3781, -3.4360], name: "United Kingdom" },
    { latLng: [60.1282, 18.6435], name: "Sweden" },
  ];

  const regionStyle = {
    initial: {
      fill: mapColor || "#D0D5DD",
      stroke: "none",
    },
    hover: {
      fillOpacity: 0.7,
      cursor: "pointer",
    },
    selected: {
      fill: "#465FFF",
    },
  };

  return (
    <VectorMap
      map={worldMill}
      backgroundColor="transparent"
      markersSelectable={true}
      markers={markers}
      regionStyle={regionStyle}
      zoomMax={12}
      zoomMin={1}
      zoomAnimate={true}
    />
  );
};

export default CountryMap;
