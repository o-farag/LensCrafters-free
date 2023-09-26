import * as React from 'react';
import { Modal, Text, Stack, Button, Flex } from '@mantine/core';
import { IconView360 } from '@tabler/icons-react';
import BoomBox from "../resources/BoomBox.glb";
import "@google/model-viewer/dist/model-viewer";


export function VisualizeOptionsPage() {

    const [opened3D, setOpened3D] = React.useState(false);
    const model_viewer_style = {
        width: "auto",
        height: "37em"
    }
    return (
        <>
            <Modal opened={opened3D} onClose={() => setOpened3D(false)} size='70em' maxHeight='100%' radius='1' padding='0'>
                {
                    <Stack padding='0' gap='0'>
                        <model-viewer style={model_viewer_style} src={BoomBox} camera-controls auto-rotate />
                        <Flex fluid align='center' justify='space-between' bg='#FBF6E9' h='4em' w='100%' gap='sm' px='1em'>
                            <Text size='sm' fs='italic' padding='1em'>Lens material:</Text>
                            <Flex align='center' gap='md'>
                                <Text size='sm'>Frame #1</Text>
                                <Button variant='filled'>Change Selection</Button>
                            </Flex>
                        </Flex>
                    </Stack>
                }
            </Modal>
            <Flex justify='center' align='center'>
                <Button variant='outline' leftSection={<IconView360 size={14} />} onClick={() => setOpened3D(true)}>View</Button>
            </Flex>
        </>
    );
}