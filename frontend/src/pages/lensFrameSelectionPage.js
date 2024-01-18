import * as React from 'react';
import { Header } from '../components/header'
import { Flex, ActionIcon, Title, Select, Popover, Text, Space, Button, Loader } from '@mantine/core';
import { IconChevronLeft, IconHelpCircle } from '@tabler/icons-react';
import { Carousel } from '@mantine/carousel';
import { FrameCard } from '../components/frameCard';
import { StepperBar } from '../components/stepperBar';
import { AppStateContext } from './AppStateContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { respondToBrowserState } from './homePage';

export function LensFrameSelectionPage(props) {
    const [isValid, setValid] = React.useState(false);
    const [isLoading, setLoading] = React.useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    React.useEffect(() => {
      setActive(respondToBrowserState(location));
    });

    const {
        prescription,
        material, setMaterial,
        frameID, setFrameID,
        active, setActive,
        glassMaterials,
        plasticMaterials,
        frames
      } = React.useContext(AppStateContext);

    async function handleGenerate() {
        setLoading(true);
        setActive(2);
        const separatorIndex = material.lastIndexOf('-');
        const composition = material.slice(0, separatorIndex).trim();
        const refractionIndex = parseFloat(material.slice(separatorIndex + 1));

        const result = {};

        Object.keys(prescription)
            .forEach(key => result[key] = prescription[key]);

        const c = { COMPOSITION: composition, IOR: refractionIndex, FRAME_ID: frameID };

        Object.keys(c)
            .forEach(key => result[key] = c[key]);

        const prescriptionJson = JSON.stringify(result);
        const response = await fetch("http://127.0.0.1:5100/prescription", {
            method: "POST",
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json'
            },
            body: prescriptionJson
        })
        if (response.ok) {
            navigate('/visualize-options');
        } else {
            console.error('An error occurred:', response.statusText);
        }
    }

    return (
        <>
            <Header />
            <Flex direction='column' pt='2.5em' pl='3em' pr='13em' gap='1em' >
                <Flex align='center' gap='1em'>
                    <ActionIcon
                        variant="transparent" color="rgba(0, 0, 0, 1)" size="xl" aria-label="Settings"
                        onClick={() => {
                            navigate('/')
                            setActive(0);
                        }}>
                        <IconChevronLeft style={{ width: '80%', height: '80%' }} stroke={1.5} />
                    </ActionIcon>
                    <StepperBar active={active}></StepperBar>
                </Flex>
                <Title order={2} pl='2.5em'>Select Lens Material</Title>
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
                        value={material}
                        radius='0.25em'
                        onChange={(value) => setMaterial(value)}></Select>
                    <Popover width={500} position="bottom" withArrow shadow="md">
                        <Popover.Target>
                            <ActionIcon
                                variant="transparent" color="rgba(0, 0, 0, 0.6)" size="xl" aria-label="Settings"
                                onClick={() => navigate('/')}>
                                <IconHelpCircle style={{ width: '80%', height: '80%' }} stroke={1.5} />
                            </ActionIcon>
                        </Popover.Target>
                        <Popover.Dropdown>
                            <Text size="sm">The index of refraction determines how thin or thick your glasses lenses will be: the higher the index, the thinner the lens. <br /><br />
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
                <Button ml='4.5em' mt='2em' h='3em' w='10em' disabled={!isValid || isLoading} onClick={handleGenerate}>
                    {isLoading ? <Loader size="xs" /> : 'Generate'}
                </Button>
                {!isValid &&
                    <Text size='sm' pl='4.5em' c='gray'>Please select a pair of frames to proceed.</Text>
                }
            </Flex>
        </>
    );
}