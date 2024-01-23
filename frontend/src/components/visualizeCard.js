import * as React from 'react';
import { Text, Card, Image, Button, Flex, Modal, Stack, Switch } from '@mantine/core';
import { IconView360, IconCamera } from '@tabler/icons-react';
import viewer_thumbnail from '../resources/viewer_thumbnail.png';
import try_on_thumbnail from '../resources/try_on_thumbnail.png';
import { useNavigate } from 'react-router-dom';
import { TryOnViewer } from './tryOnViewer';

export function VisualizeCard(props) {
    const [opened3D, setOpened3D] = React.useState(false);
    const [showFrame, setShowFrame] = React.useState(true);
    const modalRef = React.useRef(null);
    const navigate = useNavigate();

    const model_viewer_style = {
        width: 'auto',
        height: '37em',
        background: 'radial-gradient(circle 300px at center, #c1c5c8, #a7b9cd)',
    }

    const lensUrl = 'http://localhost:5100//get-model/lensOnly.glb?' + String(Date.now());
    const lensAndFrameUrl = 'http://localhost:5100//get-model/generated.glb?' + String(Date.now());

    const src = props.title === '3D Interactive Viewer' ? viewer_thumbnail : try_on_thumbnail;

    return (
        <>
            <Card
                shadow='sm'
                padding='xl'
                withBorder
                w='40%'
                h='35em'
                align='center'
                justify='space-between'
            >
                <Flex direction='column' mih='9em'>
                    <Text fw={600} size='lg' mt='lg'>
                        {props.title}
                    </Text>
                    <Text fw={400} size='sm' mt='lg' px='3em'>
                        {props.description}
                    </Text>
                </Flex>
                <Card.Section>
                    <Image
                        p='1em'
                        src={src}
                        style={{ width: '80%', height: '18em', objectFit: 'cover' }}
                    />
                </Card.Section>
                {props.title === '3D Interactive Viewer' ? <Button variant='outline' leftSection={<IconView360 size={14} />} onClick={() => setOpened3D(true)} mx='35%' mt='1em'>VIEW</Button>
                    : <Button variant='outline' leftSection={<IconCamera size={14} />} onClick={() => setOpened3D(true)} mx='35%' mt='1em'>TRY-ON</Button>}
            </Card>
            {props.title === '3D Interactive Viewer' ?
                <Modal opened={opened3D} onClose={() => setOpened3D(false)} size='70em' radius='1' padding='0'>
                    {
                        <Stack padding='0' gap='0'>
                            <model-viewer style={model_viewer_style} src={showFrame ? lensAndFrameUrl : lensUrl} camera-controls auto-rotate />
                            <Flex align='center' justify='space-between' bg='#e0ddd7' h='4em' w='100%' gap='sm' px='1em'>
                                <Text size='sm' fs='italic' padding='1em'>Lens material: {props.material}</Text>
                                <Flex align='center' gap='md'>
                                    <Text size='sm'>{props.frame}</Text>
                                    <Text size='sm' padding='1em'>{props.frameName}</Text>
                                    <Button variant='light' onClick={() => navigate('/select-lens-frame')}>Change Selection</Button>
                                    <Switch size='xl' onLabel='Show Frames' offLabel='Hide Frames' checked={showFrame} onChange={(event) => setShowFrame(event.currentTarget.checked)} />
                                </Flex>
                            </Flex>
                        </Stack>
                    }
                </Modal>
                :
                <Modal.Root opened={opened3D} onClose={() => setOpened3D(false)} size='70em' radius='1' padding='0'>
                    <Modal.Overlay />
                    <Modal.Content>
                        <Modal.Body>
                            {
                                <Stack padding='0' gap='0' ref={modalRef}>
                                    <TryOnViewer opened={opened3D} modalRef={modalRef} material={props.material} frameName={props.frameName} />
                                </Stack>
                            }
                        </Modal.Body>
                    </Modal.Content>
                </Modal.Root>}

        </>


    );
}