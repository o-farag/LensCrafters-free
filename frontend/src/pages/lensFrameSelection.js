import * as React from 'react';
import { Header } from '../components/header'
import { Flex, ActionIcon, Title, Select, Popover, Text, Space, Button } from '@mantine/core';
import { IconChevronLeft, IconHelpCircle } from '@tabler/icons-react';
import { Carousel } from '@mantine/carousel';
import round_metal_preview from '../resources/round_metal_preview.png'
import wayfarer_ease_preview from '../resources/wayfarer_ease_preview.png'
import aviator_preview from '../resources/aviator_preview.png'
import { FrameCard } from '../components/frameCard';


export function LensFrameSelection(props) {
    const glassMaterials = ['Crown Glass - 1.52', 'Flint Glass - 1.6'];
    const plasticMaterials = ['Standard Plastic - 1.5', 'Polycarbonate - 1.59', 'High-index Plastic - 1.57', 'High-index Plastic - 1.67', 'High-index Plastic - 1.74'];

    const [material, setMaterial] = React.useState(plasticMaterials[0]);
    const [frameID, setFrameID] = React.useState(0);
    const [isValid, setValid] = React.useState(false);

    const frames = [
        {
            id: 1,
            src: round_metal_preview,
            name: 'Ray Ban Round Metal',
            material: 'Metal'
        },
        {
            id: 2,
            src: wayfarer_ease_preview,
            name: 'Ray Ban Wayfarer Ease',
            material: 'Propionate'
        },
        {
            id: 3,
            src: aviator_preview,
            name: 'Ray Ban Aviator Classic',
            material: 'Metal'
        }
    ]


    async function handleGenerate() {
        const separatorIndex = material.lastIndexOf('-');
        const composition = material.slice(0, separatorIndex).trim();
        const refractionIndex = parseFloat(material.slice(separatorIndex + 1));
        const prescription = JSON.stringify({ COMPOSITION: composition, IOR: refractionIndex, FRAME_ID: frameID });
        const response = await fetch("http://127.0.0.1:5100/prescription", {
            method: "POST",
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json'
            },
            body: prescription
        })
        if (response.ok) {
            props.setCurrentView('visualizeOptions')
        }
    }

    return (
        <>
            <Header setCurrentView={props.setCurrentView} />
            <Flex direction='column' pt='2.5em' pl='3em' pr='10em' gap='1em' >
                <Flex align='center' gap='1em'>
                    <ActionIcon
                        variant="transparent" color="rgba(0, 0, 0, 1)" size="xl" aria-label="Settings"
                        onClick={() => props.setCurrentView('home')}>
                        <IconChevronLeft style={{ width: '80%', height: '80%' }} stroke={1.5} />
                    </ActionIcon>
                    <Title order={2}>Select Lens Material</Title>
                </Flex>
                <Flex align='center' gap='1em'>
                    <Select
                        pl='3.5em'
                        w='30em'
                        searchable
                        label=''
                        data={[
                            { group: 'Plastic', items: plasticMaterials },
                            { group: 'Glass', items: glassMaterials },
                        ]}
                        placeholder={plasticMaterials[0]}
                        radius='0.25em'
                        onChange={(value) => setMaterial(value)}></Select>
                    <Popover width={500} position="bottom" withArrow shadow="md">
                        <Popover.Target>
                            <ActionIcon
                                variant="transparent" color="rgba(0, 0, 0, 0.6)" size="xl" aria-label="Settings"
                                onClick={() => props.setCurrentView('home')}>
                                <IconHelpCircle style={{ width: '80%', height: '80%' }} stroke={1.5} />
                            </ActionIcon>
                        </Popover.Target>
                        <Popover.Dropdown>
                            <Text size="sm">The index of refraction determines how thin or thick your glasses lenses will be: the higher the index, the thinner the lens. <br/><br/>
                            When it comes to materials, plastic lenses are generally lighter and more comfortable than glass lenses, while glass lenses tend to be more durable and has better optical clarity.</Text>
                        </Popover.Dropdown>
                    </Popover>
                </Flex>
                <Space h='md'></Space>
                <Title order={2} pl='2.5em'>Select Frames</Title>
                <Flex pl='1em'>
                    <Carousel
                        slideSize="33.333333%"
                        slideGap='md'
                        align="start"
                        slidesToScroll={1}
                        px='4em'
                        style={{ maxWidth: '75em' }}
                    >
                        {frames.map((frame) => (
                            <Carousel.Slide key={frame.id}>
                                <FrameCard frame={frame} frames={frames} frameID={frameID} setFrameID={setFrameID} setValid={setValid} />
                            </Carousel.Slide>
                        ))}
                    </Carousel>
                </Flex>
                <Button ml='4.5em' mt='2em' h='3em' w='10em' disabled={!isValid} onClick={handleGenerate}>Generate</Button>
                {!isValid &&
                    <Text size='sm' pl='4.5em' c='gray'>Please select a pair of frames to proceed.</Text>
                }
            </Flex>
        </>
    );
}