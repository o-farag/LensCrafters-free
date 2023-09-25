import React from "react";
import "@google/model-viewer/dist/model-viewer";
import { Text } from '@mantine/core';

import BoomBox from "./BoomBox.glb";

export function GLTFViewer() {
  return (
    <div >
       <Text size='xl'>Place viewer here</Text>
      <model-viewer src={BoomBox} camera-controls />
    </div>
  );
}
